


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
        this.selectedPlayerName = null;
        this.diceButtons = [];
        this.undoButton = null;
        this.moveHistory = [];
        
        // Score tracking for each player
        this.playerScores = {};

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

    getStackOffset = (stackIndex, stackCount, spacing) => {
        if (stackCount <= 1) {
            return { x: 0, y: 0 };
        }

        // Keep pieces readable when multiple players occupy one tile.
        if (stackCount === 2) {
            return {
                x: stackIndex === 0 ? -spacing : spacing,
                y: 0
            };
        }

        if (stackCount === 3) {
            return {
                x: (stackIndex - 1) * spacing,
                y: 0
            };
        }

        const row = Math.floor(stackIndex / 2);
        const col = stackIndex % 2;
        return {
            x: col === 0 ? -spacing : spacing,
            y: row === 0 ? -spacing / 2 : spacing / 2
        };
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

        const spacing = Math.max(8, Math.round(this.scale * TILE_SIZE * 0.25));

        Object.values(positionBuckets).forEach((bucket) => {
            bucket.forEach((playerName, index) => {
                const piece = this.players[playerName].getPiece();
                const baseLeft = Number.parseInt(piece.style.left || "0", 10);
                const baseBottom = Number.parseInt(piece.style.bottom || "0", 10);
                const offset = this.getStackOffset(index, bucket.length, spacing);

                piece.style.left = `${baseLeft + offset.x}px`;
                piece.style.bottom = `${baseBottom + offset.y}px`;
            });
        });
    }

    updateTurn = async () => {

        if (this.podium.includes(this.playerNames[this.currentPlayerTurn]) === false) {
            for (let playerName in this.players) {
                let player = this.players[playerName];
                player.getButton().disabled = true;
            }

            for (let playerName in this.players) {
                let player = this.players[playerName];
                player.getPiece().classList.remove("active");
            }

            if (this.numberOfPlayers === 1 && this.currentPlayerTurn === 1) {
                this.players["computer"].getButton().disabled = false;
                this.players["computer"].getPiece().classList.add("active");
            } else {
                this.players[this.playerNames[this.currentPlayerTurn]].getButton().disabled = false;
                this.players[this.playerNames[this.currentPlayerTurn]].getPiece().classList.add("active");
            }
        }


    }

    playGame = async (player, forcedDiceRoll = null) => {
        player.getButton().disabled = true;
        player.getPiece().style.zIndex = "99";
        this.setDiceButtonsDisabled(true);
        this.setUndoDisabled(true);
        let logPara = document.getElementById("log");
        const playerName = player.getName();
        const previousPosition = this.playerPositions[playerName];

        // Roll the dice
        this.playAudio("./audio/roll.mp3");
        let diceRoll = forcedDiceRoll ?? this.rollDice();
        document.getElementById("dice").style.backgroundPositionX = `${this.diceImagePositions[diceRoll - 1]}px`;

        await new Promise(resolve => setTimeout(resolve, 500));
        let finalPosition = this.playerPositions[playerName] + diceRoll;

        if (diceRoll === 6) {
            this.playAudio("./audio/bonus.mp3");
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        if (finalPosition <= 36) {
            if (player.getPosition() === 0) {
                if (diceRoll === 6) {
                    this.playerPositions[playerName] = 1;
                    player.setPosition(1);
                    player.updatePosition();
                    this.updatePieceStacking();
                    this.playAudio("./audio/move.mp3");
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            } else {
                for (let i = this.playerPositions[playerName]; i <= finalPosition; i++) {
                    this.playerPositions[playerName] = i;
                    player.setPosition(this.playerPositions[playerName]);
                    player.updatePosition();
                    this.updatePieceStacking();
                    this.playAudio("./audio/move.mp3");
                    await new Promise(resolve => setTimeout(resolve, 150));
                }

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
            player.getPiece().style.bottom = "-70px";
        }




        player.getButton().disabled = false;
        player.getPiece().style.zIndex = "1";
        this.setDiceButtonsDisabled(false);
        this.setUndoDisabled(this.moveHistory.length === 0);

        this.storeGameSnapshot(this.playerPositions, this.currentPlayerTurn, this.numberOfPlayers);
        player.setPosition(this.playerPositions[playerName]);
        player.updatePosition();
        this.updatePieceStacking();
        this.updateTurn();



    }


    showMenu = () => {
        document.querySelector("#menu").style.display = "block";
        document.querySelector("#playground").style.display = "none";
        this.setDiceButtonsDisabled(true);
    }

    playGround = () => {
        document.querySelector("#menu").style.display = "none";
        document.querySelector("#playground").style.display = "block";
        this.setDiceButtonsDisabled(false);
        this.selectedPlayerName = null;
        this.moveHistory = [];
        this.setUndoDisabled(true);

        this.storeGameSnapshot();

        this.updatePlayers();
        this.updateTurn();
    }

    playAudio = (src) => {
        var audio = new Audio(src);

        if (src == "./audio/bg.mp3") {
            audio.volume = 0.1;
        } else {
            audio.volume = 1;
        }
        audio.play();
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

        const playerIndex = this.playerNames.indexOf(playerName);
        this.currentPlayerTurn = playerIndex >= 0 ? playerIndex : 0;
    }

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

        if (!Number.isInteger(forcedRunNumber) || forcedRunNumber < 1 || forcedRunNumber > 6) {
            alert("Run number must be an integer from 1 to 6.");
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


        const board = new Board(boardElement, GAME_BOARD_BG_02, SNAKES_AND_LADDERS_03);

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

        const  windowResize = () => {
            const boardWrapper = document.querySelector("#boardWrapper");
            
            if (boardWrapper) {
                console.log(boardWrapper);
                this.scale = boardWrapper.clientWidth / 500;
                console.log(this.scale);
                console.log(this.playerPositions);
                for (let player in this.players) {
                    this.players[player].setScale(this.scale);
                }

                this.updatePieceStacking();
            }
        }

        window.addEventListener("resize",windowResize);


        this.updateTurn();
    }
}

const gameBoard = new GameBoard();
gameBoard.initializeGame();