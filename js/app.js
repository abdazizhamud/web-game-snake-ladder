


class GameBoard {
    constructor() {
        this.diceImagePositions = [380, 318, 256, 195, 133, 71];
        this.players = {};
        this.playerPositions = {};
        this.currentPlayerTurn = 0;
        this.numberOfPlayers = 4;
        this.isPlaying = false;
        this.playerNames = ["red", "green", "blue", "yellow", "computer"];
        this.isGameOver = true;
        this.podium = [];
        this.scale = 1;
        this.selectedPlayerName = "red";
        this.diceButtons = [];
        this.undoButton = null;
        this.moveHistory = [];

        // Score tracking for each player
        this.playerScores = {};

        // Bomb tracking: set of squares that still have bombs
        this.activeBombs = new Set(BOMB_SQUARES);
    }

    getBoard = () => {
        return this.board;
    }

    setBoard = (board) => {
        this.board = board;
    }

    getPlayers = () => {
        return this.players;
    }

    setPlayers = (players) => {
        this.players = players;
    }

    getCurrentPlayerTurn = () => {
        return this.currentPlayerTurn;
    }

    setCurrentPlayerTurn = (currentPlayerTurn) => {
        this.currentPlayerTurn = currentPlayerTurn;
    }

    getNumberOfPlayers = () => {
        return this.numberOfPlayers;
    }

    setNumberOfPlayers = (numberOfPlayers) => {
        this.numberOfPlayers = numberOfPlayers;
    }

    getIsPlaying = () => {
        return this.isPlaying;
    }

    setIsPlaying = (isPlaying) => {
        this.isPlaying = isPlaying;
    }

    getDiceImagePositions = () => {
        return this.diceImagePositions;
    }

    rollDice = () => {
        let val = Math.floor(Math.random() * 6) + 1;
        // let val = 1;
        return val;
    }

    setPodium = (newPlayer) => {
        if (!this.podium.includes(newPlayer)) {
            this.podium.push(newPlayer);
            let currentFinisher = this.players[newPlayer];
            currentFinisher.getPiece().classList.add("podium");
            document.querySelector("#gamePodium").appendChild(currentFinisher.getPiece());
        }

        if (this.podium.length > 0) {
            document.querySelector("#gamePodium").style.display = "flex";
        } else {
            document.querySelector("#gamePodium").style.display = "none";

        }
    }

    updatePodium = () => {
        for (let playerName in this.playerPositions) {
            if (this.playerPositions[playerName] === 36) {
                this.setPodium(playerName);
            }
        }
    }

    gameOver = async () => {
        alert("Game is over!");
        alert("Winner is " + this.podium[0]);
        alert("PODIUM: " + this.podium);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        for (let playerName in this.playerPositions) {
            if (this.playerPositions[playerName] === 36) {
                let currentFinisher = this.players[playerName];
                currentFinisher.getPiece().classList.remove("podium");
                document.querySelector("#gamePodium").removeChild(currentFinisher.getPiece());
                document.querySelector("#gameBoard").appendChild(currentFinisher.getPiece());
            }
        }
        this.resetGame();
        this.updatePodium();
    }


    storeGameSnapshot = () => {
        let gameState = {
            position: this.playerPositions,
            turn: this.currentPlayerTurn,
            players: this.numberOfPlayers
        };
        localStorage.setItem("gameState", JSON.stringify(gameState));
    }


    updatePlayers = () => {
        const playersPlayButton = document.getElementsByClassName("play");

        let i = 0;
        // Display only selected player play button
        Array.from(playersPlayButton).forEach((playerPlayButton, index) => {
            if (index + 1 > this.numberOfPlayers) {
                playerPlayButton.style.display = "none";
            } else {
                playerPlayButton.style.display = "block";
            }

            if (this.numberOfPlayers === 1) {
                document.querySelector("#computer").style.display = "block";
            } else {
                document.querySelector("#computer").style.display = "none";
            }
        });

        // Display only selected player piece
        for (let playerName in this.players) {
            let player = this.players[playerName];
            if (i + 1 > this.numberOfPlayers) {
                player.getPiece().style.display = "none";
            } else {
                player.getPiece().style.display = "block";
            }
            if (this.numberOfPlayers === 1) {
                this.players["computer"].getPiece().style.display = "block";
            } else {
                this.players["computer"].getPiece().style.display = "none";
            }
            i++;
        }

        this.updatePieceStacking();
    }

    getStackLayoutNames = () => {
        const activePlayers = this.getActivePlayerNames();
        return activePlayers.filter((playerName) => {
            const player = this.players[playerName];
            return player && player.getPiece().style.display !== "none" && !this.podium.includes(playerName);
        });
    }

    getStackOffset = (stackIndex, stackCount) => {
        const redPlayer = this.players["red"];
        const W = redPlayer ? redPlayer.tileWidth : 100;
        const H = redPlayer ? redPlayer.tileHeight : 100;

        if (stackCount <= 1) {
            return { x: 0, y: 0 };
        }

        // 2 players: side-by-side
        if (stackCount === 2) {
            return {
                x: Math.round(stackIndex === 0 ? -W * 0.16 : W * 0.16),
                y: 0
            };
        }

        // 3 players: triangle
        if (stackCount === 3) {
            if (stackIndex === 0) {
                return { x: Math.round(-W * 0.16), y: Math.round(-H * 0.12) };
            } else if (stackIndex === 1) {
                return { x: Math.round(W * 0.16), y: Math.round(-H * 0.12) };
            } else {
                return { x: 0, y: Math.round(H * 0.15) };
            }
        }

        // 4 players: 2x2 grid
        if (stackCount === 4) {
            const row = Math.floor(stackIndex / 2);
            const col = stackIndex % 2;
            return {
                x: Math.round(col === 0 ? -W * 0.16 : W * 0.16),
                y: Math.round(row === 0 ? -H * 0.12 : H * 0.12)
            };
        }

        // 5 players: 2x2 grid + 1 center
        if (stackIndex < 4) {
            const row = Math.floor(stackIndex / 2);
            const col = stackIndex % 2;
            return {
                x: Math.round(col === 0 ? -W * 0.16 : W * 0.16),
                y: Math.round(row === 0 ? -H * 0.12 : H * 0.12)
            };
        }
        return { x: 0, y: 0 };
    }

    updatePieceStacking = () => {
        const layoutNames = this.getStackLayoutNames();
        const positionBuckets = {};

        layoutNames.forEach((playerName) => {
            this.players[playerName].setPosition(this.playerPositions[playerName]);
            this.players[playerName].updatePosition();
        });

        layoutNames.forEach((playerName) => {
            const position = this.playerPositions[playerName];
            if (!positionBuckets[position]) {
                positionBuckets[position] = [];
            }

            positionBuckets[position].push(playerName);
        });

        Object.entries(positionBuckets).forEach(([position, bucket]) => {
            // Skip stacking for position 0 (starting area) - pieces stay in their lanes
            if (position === "0") {
                return;
            }

            bucket.forEach((playerName, index) => {
                const piece = this.players[playerName].getPiece();
                const baseLeft = Number.parseInt(piece.style.left || "0", 10);
                const baseBottom = Number.parseInt(piece.style.bottom || "0", 10);
                const offset = this.getStackOffset(index, bucket.length);

                piece.style.left = `${baseLeft + offset.x}px`;
                piece.style.bottom = `${baseBottom + offset.y}px`;
            });
        });
    }

    updateTurn = async () => {
        // Remove active highlight from all pieces
        for (let playerName in this.players) {
            this.players[playerName].getPiece().classList.remove("active");
            this.players[playerName].getButton().classList.remove("active-player");
        }

        // Highlight the currently selected player
        const activeName = (this.numberOfPlayers === 1 && this.currentPlayerTurn === 1)
            ? "computer"
            : this.playerNames[this.currentPlayerTurn];

        if (this.players[activeName]) {
            this.players[activeName].getPiece().classList.add("active");
            this.players[activeName].getButton().classList.add("active-player");
        }
    }

    playGame = async (player, forcedDiceRoll = null) => {
        player.getPiece().style.zIndex = "99";
        this.setDiceButtonsDisabled(true);
        this.setUndoDisabled(true);
        let logPara = document.getElementById("log");
        const playerName = player.getName();
        const previousPosition = this.playerPositions[playerName];

        // Roll the dice
        this.playAudio("./audio/roll.mp3");
        let diceRoll = forcedDiceRoll ?? this.rollDice();

        await new Promise(resolve => setTimeout(resolve, 500));
        let finalPosition = this.playerPositions[playerName] + diceRoll;

        if (diceRoll === 6) {
            this.playAudio("./audio/bonus.mp3");
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Clamp finalPosition to 36: jika melebihi, bidak tetap berjalan hingga kotak 36 dan menang
        const clampedFinal = Math.min(finalPosition, 36);

        if (player.getPosition() === 0) {
            // First: spawn at tile 1 (visual entry point)
            this.playerPositions[playerName] = 1;
            player.setPosition(1);
            player.updatePosition();
            this.updatePieceStacking();
            this.playAudio("./audio/move.mp3");
            await new Promise(resolve => setTimeout(resolve, 150));
            // Then: step forward tile by tile up to clampedFinal
            for (let i = 2; i <= clampedFinal; i++) {
                this.playerPositions[playerName] = i;
                player.setPosition(i);
                player.updatePosition();
                this.updatePieceStacking();
                this.playAudio("./audio/move.mp3");
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        } else {
            for (let i = this.playerPositions[playerName]; i <= clampedFinal; i++) {
                this.playerPositions[playerName] = i;
                player.setPosition(this.playerPositions[playerName]);
                player.updatePosition();
                this.updatePieceStacking();
                this.playAudio("./audio/move.mp3");
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }

        await new Promise(resolve => setTimeout(resolve, 250));

        if (this.playerPositions[playerName] < 36) {
            let initialPos = this.playerPositions[playerName];
            if (this.playerPositions[playerName] in this.board.getSnakeAndLadders()) {
                let newPos = this.board.getSnakeAndLadders()[this.playerPositions[playerName]];

                this.playerPositions[playerName] = newPos;
                player.setPosition(this.playerPositions[playerName]);
                player.updatePosition();
                this.updatePieceStacking();

                if (initialPos > this.playerPositions[playerName]) {
                    this.playAudio("./audio/fall.mp3");
                } else {
                    this.playAudio("./audio/rise.mp3");
                }

            }

            // CHECK BOMB: if current square has an active bomb, trigger it!
            const currentPos = this.playerPositions[playerName];
            if (this.activeBombs.has(currentPos)) {
                await this.triggerBomb(currentPos, playerName);
            }

            let msg = `[${new Date().toLocaleTimeString()}] Player rolled a ${diceRoll}. Current Position: ${this.playerPositions[playerName]} <br/>`;
            logPara.innerHTML += msg;

            // // CHECK IF current player has attacked others in same position and make them restart again!
            // for (let playerName in this.playerPositions) {

            //     if (playerName !== player.getName() && player.getPosition() !== 0) {
            //         if (this.playerPositions[player.getName()] === this.playerPositions[playerName]) {
            //             this.playerPositions[playerName] = 0;
            //             isCaptured = true;
            //             this.playAudio("./audio/fall.mp3");
            //             await new Promise(resolve => setTimeout(resolve, 150));
            //             this.players[playerName].setPosition(0);
            //             this.players[playerName].updatePosition();
            //         }
            //     }
            // }



        } else {
            let msg = `[${new Date().toLocaleTimeString()}] Player reached the final square. Game over!`;
            logPara.innerHTML += msg;
            player.setPosition(36);
            player.updatePosition();
            this.updatePieceStacking();

            this.setPodium(playerName);
            console.log(this.podium);
            // this.podium.push(player.getName());
            // alert(`You won!, ${player.getName()}`);
            // this.resetGame();
            // this.isGameOver = true;
        }

        const scoreGain = Math.max(0, this.playerPositions[playerName] - previousPosition);
        this.playerScores[playerName].score += scoreGain;
        this.updateScoreboard();

        let calculatedPlayer = this.numberOfPlayers === 1 ? 2 : this.numberOfPlayers;
        if ((this.podium.length === calculatedPlayer) || this.isGameOver === true) {
            this.gameOver();
            return;
        }


        if (this.playerPositions[playerName] == 0) {
            player.updatePosition(); // let player.js handle position=0 placement
        }




        // (bidak buttons are never disabled — they are always selectable)
        player.getPiece().style.zIndex = "1";
        this.setDiceButtonsDisabled(false);
        this.setUndoDisabled(this.moveHistory.length === 0);

        // Switch turn to the next active player automatically
        let nextTurn = this.getNextActiveTurn();
        this.currentPlayerTurn = nextTurn;
        this.selectedPlayerName = (this.numberOfPlayers === 1 && nextTurn === 1) ? "computer" : this.playerNames[nextTurn];

        this.storeGameSnapshot(this.playerPositions, this.currentPlayerTurn, this.numberOfPlayers);
        player.setPosition(this.playerPositions[playerName]);
        player.updatePosition();
        this.updatePieceStacking();
        this.updateTurn();

        // If next player is computer, trigger auto-roll
        if (this.selectedPlayerName === "computer" && !this.isGameOver) {
            this.setDiceButtonsDisabled(true); // Disable manual buttons during computer turn
            setTimeout(() => {
                const cpuRoll = Math.floor(Math.random() * 6) + 1;
                this.playerRoll(cpuRoll);
            }, 1200);
        }
    }

    getNextActiveTurn = () => {
        let activeNames = this.getActivePlayerNames();
        let checked = 0;
        let testTurn = this.currentPlayerTurn;
        while (checked < activeNames.length) {
            testTurn = (testTurn + 1) % activeNames.length;
            let nextPlayerName = this.numberOfPlayers === 1 && testTurn === 1 ? "computer" : this.playerNames[testTurn];
            if (!this.podium.includes(nextPlayerName)) {
                return testTurn;
            }
            checked++;
        }
        return this.currentPlayerTurn;
    }

    showMenu = () => {
        document.querySelector("#menu").style.display = "flex";
        document.querySelector("#playground").style.display = "none";
        this.setDiceButtonsDisabled(true);
    }

    playGround = () => {
        document.querySelector("#menu").style.display = "none";
        document.querySelector("#playground").style.display = "flex";
        this.setDiceButtonsDisabled(false);
        this.selectedPlayerName = "red"; // Select first player automatically
        this.currentPlayerTurn = 0;
        this.moveHistory = [];
        this.setUndoDisabled(true);

        this.storeGameSnapshot();
        this.updatePlayers();
        this.updateTurn();

        // Wait for layout then resize + bombs
        requestAnimationFrame(() => {
            if (window.windowResizeFn) window.windowResizeFn();
            setTimeout(() => this.initializeBombs(), 80);
        });
    }

    playAudio = (src) => {
        try {
            var audio = new Audio(src);

            if (src == "./audio/bg.mp3") {
                audio.volume = 0.1;
            } else {
                audio.volume = 1;
            }
            audio.play().catch(e => console.log("Audio play blocked or failed:", e));
        } catch (e) {
            console.log("Audio initialization failed:", e);
        }
    }

    updateScoreboard = () => {
        // Update scoreboard display
        for (const playerName in this.playerScores) {
            const rightElement = document.getElementById(`${playerName}-right`);
            const wrongElement = document.getElementById(`${playerName}-wrong`);
            const powerUpElement = document.getElementById(`${playerName}-powerup`);

            if (rightElement) {
                rightElement.textContent = this.playerScores[playerName].score;
            }
            if (wrongElement) {
                wrongElement.textContent = "0";
            }
            if (powerUpElement) {
                powerUpElement.textContent = "0";
            }
        }
    }

    getActivePlayerNames = () => {
        if (this.numberOfPlayers === 1) {
            return ["red", "computer"];
        }

        return this.playerNames.slice(0, this.numberOfPlayers);
    }

    setDiceButtonsDisabled = (isDisabled) => {
        this.diceButtons.forEach((button) => {
            button.disabled = isDisabled;
        });
    }

    setUndoDisabled = (isDisabled) => {
        if (this.undoButton) {
            this.undoButton.disabled = isDisabled;
        }
    }

    saveHistoryState = () => {
        const historyState = {
            playerPositions: { ...this.playerPositions },
            currentPlayerTurn: this.currentPlayerTurn,
            selectedPlayerName: this.selectedPlayerName,
            podium: [...this.podium],
            playerScores: JSON.parse(JSON.stringify(this.playerScores))
        };

        this.moveHistory.push(historyState);
        this.setUndoDisabled(false);
    }

    renderBoardState = () => {
        const boardEl = document.querySelector("#gameBoard");

        for (const playerName in this.players) {
            const playerPiece = this.players[playerName].getPiece();
            playerPiece.classList.remove("podium");
            boardEl.appendChild(playerPiece);
        }

        const restoredPodium = [...this.podium];
        this.podium = [];
        restoredPodium.forEach((playerName) => this.setPodium(playerName));

        for (const playerName in this.players) {
            this.players[playerName].setPosition(this.playerPositions[playerName]);
            this.players[playerName].updatePosition();
        }

        this.updatePieceStacking();
    }

    undoLastMove = () => {
        if (this.moveHistory.length === 0) {
            alert("No move to undo.");
            return;
        }

        const previousState = this.moveHistory.pop();
        this.playerPositions = { ...previousState.playerPositions };
        this.currentPlayerTurn = previousState.currentPlayerTurn;
        this.selectedPlayerName = previousState.selectedPlayerName;
        this.podium = [...previousState.podium];
        this.playerScores = JSON.parse(JSON.stringify(previousState.playerScores));

        this.renderBoardState();
        this.updateScoreboard();
        this.updatePlayers();
        this.updateTurn();
        this.storeGameSnapshot();
        this.setUndoDisabled(this.moveHistory.length === 0);
    }

    setTurnFromPlayerName = (playerName) => {
        if (this.numberOfPlayers === 1 && playerName === "computer") {
            this.currentPlayerTurn = 1;
            return;
        }
        console.log(playerName)
        const playerIndex = this.playerNames.indexOf(playerName);
        this.currentPlayerTurn = playerIndex >= 0 ? playerIndex : 0;
    }

    // --- BOMB SYSTEM ---

    /**
     * Calculate pixel position (left, bottom) of a given tile on the board.
     * Returns { left, bottom, width, height } in pixels.
     */
    getTilePosition = (tileNumber) => {
        const boardEl = document.getElementById("gameBoard");
        const B_width = boardEl.clientWidth;
        const B_height = boardEl.clientHeight;

        const tile_width = (B_width * GRID_WIDTH_PCT) / TILES_PER_ROW;
        const tile_height = (B_height * GRID_HEIGHT_PCT) / TILES_PER_ROW;
        const left_offset = B_width * GRID_MARGIN_LEFT_PCT;
        const bottom_offset = B_height * GRID_MARGIN_BOTTOM_PCT;

        const rowIndex = Math.floor((tileNumber - 1) / TILES_PER_ROW);
        const colIndex = (tileNumber - 1) % TILES_PER_ROW;
        const tile_x = left_offset + (rowIndex % 2 === 0 ? colIndex : (TILES_PER_ROW - 1 - colIndex)) * tile_width;
        const tile_y = bottom_offset + rowIndex * tile_height;

        return { left: tile_x, bottom: tile_y, width: tile_width, height: tile_height };
    }

    /**
     * Render Bom.png images on all currently active bomb squares.
     */
    initializeBombs = () => {
        const boardEl = document.getElementById("gameBoard");

        // Remove existing bomb tiles
        boardEl.querySelectorAll(".bomb-tile").forEach(el => el.remove());

        this.activeBombs.forEach(square => {
            const pos = this.getTilePosition(square);
            const bombEl = document.createElement("div");
            bombEl.classList.add("bomb-tile");
            bombEl.dataset.square = square;
            bombEl.style.left = `${Math.round(pos.left)}px`;
            bombEl.style.bottom = `${Math.round(pos.bottom)}px`;
            bombEl.style.width = `${Math.round(pos.width)}px`;
            bombEl.style.height = `${Math.round(pos.height)}px`;
            boardEl.appendChild(bombEl);
        });
    }

    /**
     * Trigger bomb explosion: show Boom.gif, remove bomb, show modal.
     */
    triggerBomb = async (square, playerName) => {
        const boardEl = document.getElementById("gameBoard");
        const pos = this.getTilePosition(square);

        // Remove the Bom.png element
        const bombEl = boardEl.querySelector(`.bomb-tile[data-square="${square}"]`);
        if (bombEl) bombEl.remove();

        // Remove from active set
        this.activeBombs.delete(square);

        // Show Boom.gif on that tile
        const boomEl = document.createElement("div");
        boomEl.classList.add("boom-tile");
        boomEl.style.left = `${Math.round(pos.left - pos.width * 0.25)}px`;
        boomEl.style.bottom = `${Math.round(pos.bottom - pos.height * 0.25)}px`;
        boomEl.style.width = `${Math.round(pos.width * 1.5)}px`;
        boomEl.style.height = `${Math.round(pos.height * 1.5)}px`;
        boardEl.appendChild(boomEl);

        // Wait for boom animation (1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Remove boom
        boomEl.remove();

        // Show bomb modal popup
        const modal = document.getElementById("bombModal");
        const msg = document.getElementById("bombModalMessage");
        if (modal && msg) {
            msg.textContent = `Pemain "${playerName}" menginjak bom di kotak ${square}! Soal bom sekarang terbuka!`;
            modal.style.display = "flex";
        }
    }
    // --- END BOMB SYSTEM ---

    selectPlayerByPiece = (playerName) => {
        const activePlayers = this.getActivePlayerNames();
        if (!activePlayers.includes(playerName)) {
            return;
        }

        if (this.podium.includes(playerName)) {
            alert(`${playerName} already finished. Choose another player.`);
            return;
        }

        this.selectedPlayerName = playerName;
        this.setTurnFromPlayerName(playerName);
        this.updateTurn();
    }

    fetchGameState = () => {
        /* Get current state of game from local storage */
        let localGameState = localStorage.getItem("gameState");

        /* if game is currently saved (localStorage), retrive such game */
        if (localGameState) {
            localGameState = JSON.parse(localGameState);

            this.playerPositions = localGameState.position;
            this.currentPlayerTurn = localGameState.turn;
            this.numberOfPlayers = localGameState.players;


            this.players["red"].setPosition(this.playerPositions["red"]);
            this.players["green"].setPosition(this.playerPositions["green"]);
            this.players["blue"].setPosition(this.playerPositions["blue"]);
            this.players["yellow"].setPosition(this.playerPositions["yellow"]);
            this.players["computer"].setPosition(this.playerPositions["computer"]);

            this.players["red"].updatePosition();
            this.players["green"].updatePosition();
            this.players["blue"].updatePosition();
            this.players["yellow"].updatePosition();
            this.players["computer"].updatePosition();
            this.updatePieceStacking();
            this.playGround();
        }
    }


    resetGame = () => {
        this.playerPositions = { red: 0, green: 0, blue: 0, yellow: 0, computer: 0 };
        this.playerScores = {
            red: { score: 0 },
            green: { score: 0 },
            blue: { score: 0 },
            yellow: { score: 0 },
            computer: { score: 0 }
        };
        this.updateScoreboard();
        localStorage.removeItem("gameState");

        for (const playerName in this.players) {
            let player = this.players[playerName];
            player.setPosition(0);
            player.updatePosition();
        }

        this.updatePieceStacking();

        this.currentPlayerTurn = 0;
        this.selectedPlayerName = null;
        this.isGameOver = false;
        this.podium = [];
        this.moveHistory = [];
        this.setUndoDisabled(true);
        this.updateTurn();
        this.updatePlayers();

        // Reset bombs
        this.activeBombs = new Set(BOMB_SQUARES);
        const boardEl = document.getElementById("gameBoard");
        if (boardEl) {
            boardEl.querySelectorAll(".bomb-tile, .boom-tile").forEach(el => el.remove());
        }

        this.showMenu();
    }

    playerRoll = (forcedRunNumber) => {
        if (this.isPlaying === false) {
            this.playAudio("./audio/bg.mp3");
            this.isPlaying = true;
        }

        if (!this.selectedPlayerName) {
            alert("Choose a player by clicking a piece first.");
            return;
        }

        if (this.podium.includes(this.selectedPlayerName)) {
            alert(`${this.selectedPlayerName} already finished. Choose another player.`);
            return;
        }

        if (!Number.isInteger(forcedRunNumber) || forcedRunNumber < 1 || forcedRunNumber > 7) {
            alert("Run number must be an integer from 1 to 7.");
            return;
        }

        this.setTurnFromPlayerName(this.selectedPlayerName);
        this.updateTurn();
        this.saveHistoryState();
        this.playGame(this.players[this.selectedPlayerName], forcedRunNumber);
    }

    initializeGame = () => {
        const boardElement = document.getElementById("gameBoard");

        const redPlayerPiece = document.getElementById("redPlayerPiece"); /* Red Piece */
        const greenPlayerPiece = document.getElementById("greenPlayerPiece"); /* Green Piece */
        const bluePlayerPiece = document.getElementById("bluePlayerPiece"); /* Blue Piece */
        const yellowPlayerPiece = document.getElementById("yellowPlayerPiece"); /* Yellow Piece */
        const computerPlayerPiece = document.getElementById("computerPlayerPiece"); /* Computer Piece */

        const redPlayerBtn = document.getElementById("red"); /* Red Play Button */
        const greenPlayerBtn = document.getElementById("green"); /* Green Play Button */
        const playerBlueBtn = document.getElementById("blue"); /* Blue Play Button */
        const playerYellowBtn = document.getElementById("yellow"); /* Yellow Play Button */
        const computerPlayerBtn = document.getElementById("computer"); /* Computer Play Button */

        const redPlayer = new Player(0, "red", redPlayerPiece, redPlayerBtn, 0);
        const greenPlayer = new Player(1, "green", greenPlayerPiece, greenPlayerBtn, 0);
        const bluePlayer = new Player(2, "blue", bluePlayerPiece, playerBlueBtn, 0);
        const yellowPlayer = new Player(3, "yellow", yellowPlayerPiece, playerYellowBtn, 0);
        const computerPlayer = new Player(4, "computer", computerPlayerPiece, computerPlayerBtn, 0);

        /* Menu Buttons */
        const playComputerBtn = document.querySelector("#playComputerBtn");
        const playTwoPlayersBtn = document.querySelector("#playTwoPlayersBtn");
        const playThreePlayersBtn = document.querySelector("#playThreePlayersBtn");
        const playFourPlayersBtn = document.querySelector("#playFourPlayersBtn");
        const diceChoiceButtons = document.querySelectorAll(".dice-choice");
        const undoMoveBtn = document.querySelector("#undoMoveBtn");
        const resetBtn = document.querySelector("#resetBtn");

        let players = {
            red: redPlayer,
            green: greenPlayer,
            blue: bluePlayer,
            yellow: yellowPlayer,
            computer: computerPlayer
        };

        let playerPositions = {
            red: 0,
            green: 0,
            blue: 0,
            yellow: 0,
            computer: 0,
        };


        const board = new Board(boardElement, GAME_BOARD_BG_03, SNAKES_AND_LADDERS_03);

        this.board = board;
        this.players = players;
        this.playerPositions = playerPositions;
        this.currentPlayerTurn = 0;
        this.numberOfPlayers = 0;
        this.diceButtons = Array.from(diceChoiceButtons);
        this.undoButton = undoMoveBtn;
        this.isGameOver = false;

        this.playerScores = {
            red: { score: 0 },
            green: { score: 0 },
            blue: { score: 0 },
            yellow: { score: 0 },
            computer: { score: 0 }
        };
        this.updateScoreboard();

        redPlayerPiece.addEventListener("click", () => this.selectPlayerByPiece("red"));
        greenPlayerPiece.addEventListener("click", () => this.selectPlayerByPiece("green"));
        bluePlayerPiece.addEventListener("click", () => this.selectPlayerByPiece("blue"));
        yellowPlayerPiece.addEventListener("click", () => this.selectPlayerByPiece("yellow"));
        computerPlayerPiece.addEventListener("click", () => this.selectPlayerByPiece("computer"));

        redPlayerBtn.addEventListener("click", () => this.selectPlayerByPiece("red"));
        greenPlayerBtn.addEventListener("click", () => this.selectPlayerByPiece("green"));
        playerBlueBtn.addEventListener("click", () => this.selectPlayerByPiece("blue"));
        playerYellowBtn.addEventListener("click", () => this.selectPlayerByPiece("yellow"));
        computerPlayerBtn.addEventListener("click", () => this.selectPlayerByPiece("computer"));

        this.diceButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const runNumber = Number(button.dataset.roll);
                this.playerRoll(runNumber);
            });
        });

        this.undoButton.addEventListener("click", this.undoLastMove);
        this.setUndoDisabled(true);

        resetBtn.addEventListener("click", this.resetGame);

        playComputerBtn.addEventListener("click", (event) => {
            this.numberOfPlayers = 1;
            this.playGround();

        });

        playTwoPlayersBtn.addEventListener("click", (event) => {
            this.numberOfPlayers = 2;
            this.playGround();
        });

        playThreePlayersBtn.addEventListener("click", (event) => {
            this.numberOfPlayers = 3;
            this.playGround();
        });

        playFourPlayersBtn.addEventListener("click", (event) => {
            this.numberOfPlayers = 4;
            this.playGround();
        });

        this.fetchGameState();
        this.updatePodium();
        this.updateTurn();

        /* Start game on enter key press */
        window.addEventListener("keypress", (e) => {
            if (e.code === "Enter" && this.isGameOver === false) {
                this.playerRoll(1);
            }
            // this.playerRoll();
        });

        // Expose resize fn so playGround() can call it
        const windowResizeFn = () => {
            const boardWrapper = document.querySelector("#boardWrapper");
            const gameBoard   = document.querySelector("#gameBoard");
            const controlsBar = document.querySelector("#gameControlsBar");

            if (!boardWrapper || !gameBoard) return;

            // Let the boardWrapper fill the entire screen (occupy full viewport width and height)
            let boardW = window.innerWidth;
            let boardH = window.innerHeight;

            // Apply size to boardWrapper so it occupies full screen
            boardWrapper.style.width  = boardW + "px";
            boardWrapper.style.height = boardH + "px";

            // scale = ratio of displayed board width to nominal 1920
            this.scale = boardW / BOARD_SIZE;

            for (let player in this.players) {
                this.players[player].setScale(this.scale, boardW, boardH);
            }
            this.updatePieceStacking();

            if (document.querySelector("#playground").style.display === "flex") {
                this.initializeBombs();
            }
        };

        // Store reference so playGround can call it
        window.windowResizeFn = windowResizeFn;

        window.addEventListener("resize", windowResizeFn);
        windowResizeFn();

        this.updateTurn();
    }
}

const gameBoard = new GameBoard();
gameBoard.initializeGame();