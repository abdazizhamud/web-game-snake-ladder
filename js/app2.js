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
        this.currentQuestionIndex = 0;
        
        // Score tracking for each player
        this.playerScores = {};
        
        // Power-up tracking for each player
        this.playerPowerUps = {};
        this.quizChance = 0.5; // 50% chance to get a question
        
        // FIX: Removed duplicate "What is CO2?" questions — replaced with real varied questions
        this.questions = [
            { question: "What is H2O?", answer: "water" },
            { question: "What is the symbol for Gold?", answer: "Au" },
            { question: "How many elements are in the periodic table?", answer: "118" },
            { question: "What is the formula for table salt?", answer: "NaCl" },
            { question: "What is CO2?", answer: "carbon dioxide" },
            { question: "What planet is closest to the Sun?", answer: "Mercury" },
            { question: "How many sides does a hexagon have?", answer: "6" },
            { question: "What is the square root of 64?", answer: "8" },
            { question: "What gas do plants absorb from the air?", answer: "carbon dioxide" },
            { question: "What is the boiling point of water in Celsius?", answer: "100" },
            { question: "What is the chemical symbol for Iron?", answer: "Fe" },
        ];
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
            // FIX: Win condition was 100 — changed to TOTAL_TILES (36 for a 6x6 board)
            if (this.playerPositions[playerName] === TOTAL_TILES) {
                this.setPodium(playerName);
            }
        }
    }

    gameOver = async () => {
        await this.showToast(`🏆 Game Over! Winner: ${this.podium[0]}! Podium: ${this.podium.join(", ")}`, 3000);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        for (let playerName in this.playerPositions) {
            // FIX: Win condition was 100 — changed to TOTAL_TILES (36)
            if (this.playerPositions[playerName] === TOTAL_TILES) {
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
        // NOTE: storeGameSnapshot() reads from `this` — the extra arguments passed at the
        // call site (positions, turn, players) are ignored, which is fine since they match `this`.
        let gameState = {
            position: this.playerPositions,
            turn: this.currentPlayerTurn,
            players: this.numberOfPlayers
        };
        localStorage.setItem("gameState", JSON.stringify(gameState));
    }


    updatePlayers = () => {
        const playersPlayButton = document.getElementsByClassName("play");

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

        let i = 0;
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
                this.playGame(this.players["computer"]);
            } else {
                this.players[this.playerNames[this.currentPlayerTurn]].getButton().disabled = false;
                this.players[this.playerNames[this.currentPlayerTurn]].getPiece().classList.add("active");
            }
        }
    }


    playGame = async (player) => {
        player.getButton().disabled = true;
        player.getPiece().style.zIndex = "99";
        this.superPlayButton.disabled = true;
        let logPara = document.getElementById("log");
        let isCaptured = false;

        // Roll the dice
        this.playAudio("./audio/roll.mp3");
        let diceRoll = this.rollDice();
        document.getElementById("dice").style.backgroundPositionX = `${this.diceImagePositions[diceRoll - 1]}px`;

        await new Promise(resolve => setTimeout(resolve, 500));
        let finalPosition = this.playerPositions[player.getName()] + diceRoll;

        if (diceRoll === 6) {
            this.playAudio("./audio/bonus.mp3");
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // FIX: Win cap was 100 — changed to TOTAL_TILES (36)
        if (finalPosition <= TOTAL_TILES) {
            if (player.getPosition() === 0) {
                if (diceRoll === 6) {
                    this.playerPositions[player.getName()] = 1;
                    player.setPosition(1);
                    player.updatePosition();
                    this.playAudio("./audio/move.mp3");
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            } else {
                for (let i = this.playerPositions[player.getName()]; i <= finalPosition; i++) {
                    this.playerPositions[player.getName()] = i;
                    player.setPosition(this.playerPositions[player.getName()]);
                    player.updatePosition();
                    this.playAudio("./audio/move.mp3");
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 250));

        // FIX: Quiz trigger range was > 1 && < 100 — changed to > 1 && < TOTAL_TILES (36)
        if (this.playerPositions[player.getName()] > 1 && this.playerPositions[player.getName()] < TOTAL_TILES) {
            if (Math.random() < this.quizChance) {
                const isCorrect = await this.askQuiz(player.getName());
                if (isCorrect) {
                    this.playerScores[player.getName()].right++;
                    this.playerPowerUps[player.getName()]++;
                    // FIX: was a bare (non-awaited) call — now returns a Promise so we await it
                    // to keep the async flow sequential and prevent buttons getting stuck disabled
                    await this.showPowerUpNotification(player.getName());
                } else {
                    this.playerScores[player.getName()].wrong++;
                }
                this.updateScoreboard();
            }
        }

        // FIX: Snake/ladder check was < 100 — changed to < TOTAL_TILES (36)
        if (this.playerPositions[player.getName()] < TOTAL_TILES) {
            let initialPos = this.playerPositions[player.getName()];
            if (this.playerPositions[player.getName()] in this.board.getSnakeAndLadders()) {
                let newPos = this.board.getSnakeAndLadders()[this.playerPositions[player.getName()]];
                
                // Check if it's a snake and player has power-up
                if (initialPos > newPos && this.playerPowerUps[player.getName()] > 0) {
                    this.playerPowerUps[player.getName()]--;
                    this.playAudio("./audio/bonus.mp3");
                    // FIX: alert() here blocked the async chain — replaced with awaited toast
                    await this.showToast(`${player.getName()} used a Power-Up! Protected from the snake! 🛡️`);
                } else {
                    this.playerPositions[player.getName()] = newPos;
                    player.setPosition(this.playerPositions[player.getName()]);
                    player.updatePosition();

                    if (initialPos > this.playerPositions[player.getName()]) {
                        this.playAudio("./audio/fall.mp3");
                    } else {
                        this.playAudio("./audio/rise.mp3");
                    }
                }
            }

            let msg = `[${new Date().toLocaleTimeString()}] Player rolled a ${diceRoll}. Current Position: ${this.playerPositions[player.getName()]} <br/>`;
            logPara.innerHTML += msg;

            for (let playerName in this.playerPositions) {
                if (playerName !== player.getName() && player.getPosition() !== 0) {
                    if (this.playerPositions[player.getName()] === this.playerPositions[playerName]) {
                        this.playerPositions[playerName] = 0;
                        isCaptured = true;
                        this.playAudio("./audio/fall.mp3");
                        await new Promise(resolve => setTimeout(resolve, 150));
                        this.players[playerName].setPosition(0);
                        this.players[playerName].updatePosition();
                    }
                }
            }

        } else {
            let msg = `[${new Date().toLocaleTimeString()}] Player reached the final square. Game over!`;
            logPara.innerHTML += msg;
            // FIX: Was hardcoded 100 — changed to TOTAL_TILES (36)
            player.setPosition(TOTAL_TILES);
            player.updatePosition();
            this.setPodium(player.getName());
        }


        if ((diceRoll !== 6 && !isCaptured) || player.getPosition() >= TOTAL_TILES) {
            let playerName = player.getName();
            do {
                let calculatedPlayer = this.numberOfPlayers === 1 ? 2 : this.numberOfPlayers;
                if ((this.podium.length === calculatedPlayer) || this.isGameOver === true) {
                    this.gameOver();
                    return;
                }

                if (this.numberOfPlayers === 1) {
                    if (this.currentPlayerTurn < this.numberOfPlayers) {
                        this.currentPlayerTurn++;
                    } else {
                        this.currentPlayerTurn = 0;
                    }
                } else {
                    if (this.currentPlayerTurn < (this.numberOfPlayers - 1)) {
                        this.currentPlayerTurn++;
                    } else {
                        this.currentPlayerTurn = 0;
                    }
                }

                playerName = this.playerNames[this.numberOfPlayers === 1 && this.currentPlayerTurn === 1 ? 4 : this.currentPlayerTurn];
            } while (this.podium.includes(playerName));
        }


        if (this.playerPositions[player.getName()] == 0) {
            player.getPiece().style.bottom = "-70px";
        }

        player.getButton().disabled = false;
        player.getPiece().style.zIndex = "1";
        this.superPlayButton.disabled = false;

        this.storeGameSnapshot();
        player.setPosition(this.playerPositions[player.getName()]);
        player.updatePosition();
        this.updateTurn();
    }


    showMenu = () => {
        document.querySelector("#menu").style.display = "block";
        document.querySelector("#playground").style.display = "none";
        document.querySelector("#superplay").disabled = true;
    }

    playGround = () => {
        document.querySelector("#menu").style.display = "none";
        document.querySelector("#playground").style.display = "block";
        document.querySelector("#superplay").disabled = false;

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

    getNextQuestion = () => {
        const questionData = this.questions[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
        return { 
            questionNumber: questionNumber,
            actualQuestion: questionData.question,
            answer: questionData.answer 
        };
    }

    showQuizModal = () => {
        const modal = document.getElementById("quizModal");
        modal.classList.add("show");
    }

    hideQuizModal = () => {
        const modal = document.getElementById("quizModal");
        modal.classList.remove("show");
    }

    displayQuiz = (resolve) => {
        const quiz = this.getNextQuestion();
        const quizQuestion = document.getElementById("quizQuestion");
        const wrongBtn = document.getElementById("wrongBtn");
        const rightBtn = document.getElementById("rightBtn");

        quizQuestion.textContent = `Question ${quiz.questionNumber}`;

        this.showQuizModal();

        const handleWrongClick = () => {
            wrongBtn.removeEventListener("click", handleWrongClick);
            rightBtn.removeEventListener("click", handleRightClick);
            this.hideQuizModal();
            resolve(false);
        };

        const handleRightClick = () => {
            wrongBtn.removeEventListener("click", handleWrongClick);
            rightBtn.removeEventListener("click", handleRightClick);
            this.hideQuizModal();
            resolve(true);
        };

        wrongBtn.addEventListener("click", handleWrongClick);
        rightBtn.addEventListener("click", handleRightClick);
    }

    updateScoreboard = () => {
        for (const playerName in this.playerScores) {
            const rightElement = document.getElementById(`${playerName}-right`);
            const wrongElement = document.getElementById(`${playerName}-wrong`);
            const powerUpElement = document.getElementById(`${playerName}-powerup`);
            
            if (rightElement) rightElement.textContent = this.playerScores[playerName].right;
            if (wrongElement) wrongElement.textContent = this.playerScores[playerName].wrong;
            if (powerUpElement) powerUpElement.textContent = this.playerPowerUps[playerName] || 0;
        }
    }

    showToast = (message, duration = 2000) => {
        return new Promise((resolve) => {
            let toast = document.getElementById("gameToast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "gameToast";
                toast.style.cssText = `
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.85); color: white; padding: 18px 28px;
                    border-radius: 12px; font-size: 1.1rem; font-weight: bold;
                    z-index: 9999; text-align: center; pointer-events: none;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(toast);
            }
            toast.textContent = message;
            toast.style.opacity = "1";
            toast.style.display = "block";
            setTimeout(() => {
                toast.style.opacity = "0";
                setTimeout(() => {
                    toast.style.display = "none";
                    resolve();
                }, 300);
            }, duration);
        });
    }

    showPowerUpNotification = (playerName) => {
        // Returns a promise so callers can await it without blocking like alert() does
        return this.showToast(`🎉 ${playerName} earned a Power-Up! Shield against snakes!`);
    }

    askQuiz = (playerName) => {
        return new Promise((resolve) => {
            this.displayQuiz(resolve);
        });
    }

    fetchGameState = () => {
        let localGameState = localStorage.getItem("gameState");
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
            this.playGround();
        }
    }


    resetGame = () => {
        this.playerPositions = { red: 0, green: 0, blue: 0, yellow: 0, computer: 0 };
        this.playerScores = { 
            red: { right: 0, wrong: 0 },
            green: { right: 0, wrong: 0 },
            blue: { right: 0, wrong: 0 },
            yellow: { right: 0, wrong: 0 },
            computer: { right: 0, wrong: 0 }
        };
        this.playerPowerUps = { red: 0, green: 0, blue: 0, yellow: 0, computer: 0 };
        this.updateScoreboard();
        localStorage.removeItem("gameState");

        for (const playerName in this.players) {
            let player = this.players[playerName];
            player.setPosition(0);
            player.updatePosition();
        }

        this.currentPlayerTurn = 0;
        this.isGameOver = false;
        this.podium = [];
        this.updateTurn();
        this.updatePlayers();
        this.showMenu();
    }

    playerRoll = () => {
        if (this.isPlaying === false) {
            this.playAudio("./audio/bg.mp3");
            this.isPlaying = true;
        }
        if (this.currentPlayerTurn === 0) this.playGame(this.players["red"]);
        if (this.numberOfPlayers !== 1 && this.currentPlayerTurn === 1) this.playGame(this.players["green"]);
        if (this.currentPlayerTurn === 2) this.playGame(this.players["blue"]);
        if (this.currentPlayerTurn === 3) this.playGame(this.players["yellow"]);
        if (this.numberOfPlayers === 1 && this.currentPlayerTurn === 1) this.playGame(this.players["computer"]);
    }

    initializeGame = () => {
        const boardElement = document.getElementById("gameBoard");

        const redPlayerPiece = document.getElementById("redPlayerPiece");
        const greenPlayerPiece = document.getElementById("greenPlayerPiece");
        const bluePlayerPiece = document.getElementById("bluePlayerPiece");
        const yellowPlayerPiece = document.getElementById("yellowPlayerPiece");
        const computerPlayerPiece = document.getElementById("computerPlayerPiece");

        const redPlayerBtn = document.getElementById("red");
        const greenPlayerBtn = document.getElementById("green");
        const playerBlueBtn = document.getElementById("blue");
        const playerYellowBtn = document.getElementById("yellow");
        const computerPlayerBtn = document.getElementById("computer");

        const redPlayer = new Player(0, "red", redPlayerPiece, redPlayerBtn, 0);
        const greenPlayer = new Player(1, "green", greenPlayerPiece, greenPlayerBtn, 0);
        const bluePlayer = new Player(2, "blue", bluePlayerPiece, playerBlueBtn, 0);
        const yellowPlayer = new Player(3, "yellow", yellowPlayerPiece, playerYellowBtn, 0);
        // FIX: computerPlayer index was 1 (same as green), causing position conflicts — changed to 4
        const computerPlayer = new Player(4, "computer", computerPlayerPiece, computerPlayerBtn, 0);

        const playComputerBtn = document.querySelector("#playComputerBtn");
        const playTwoPlayersBtn = document.querySelector("#playTwoPlayersBtn");
        const playThreePlayersBtn = document.querySelector("#playThreePlayersBtn");
        const playFourPlayersBtn = document.querySelector("#playFourPlayersBtn");
        const superPlayButton = document.getElementById("superplay");
        const resetBtn = document.querySelector("#resetBtn");

        let players = {
            red: redPlayer,
            green: greenPlayer,
            blue: bluePlayer,
            yellow: yellowPlayer,
            computer: computerPlayer
        };

        let playerPositions = { red: 0, green: 0, blue: 0, yellow: 0, computer: 0 };

        // FIX: playerScores and playerPowerUps were never initialized at game start,
        // causing a crash (TypeError: cannot read property 'right' of undefined) on the
        // first quiz trigger. Now initialized alongside the players.
        this.playerScores = {
            red: { right: 0, wrong: 0 },
            green: { right: 0, wrong: 0 },
            blue: { right: 0, wrong: 0 },
            yellow: { right: 0, wrong: 0 },
            computer: { right: 0, wrong: 0 }
        };
        this.playerPowerUps = { red: 0, green: 0, blue: 0, yellow: 0, computer: 0 };

        const board = new Board(boardElement, GAME_BOARD_BG_02, SNAKES_AND_LADDERS_03);

        this.board = board;
        this.players = players;
        this.playerPositions = playerPositions;
        this.currentPlayerTurn = 0;
        this.numberOfPlayers = 0;
        this.superPlayButton = superPlayButton;
        this.isGameOver = false;

        superPlayButton.addEventListener("click", this.playerRoll);
        resetBtn.addEventListener("click", this.resetGame);

        playComputerBtn.addEventListener("click", () => {
            this.numberOfPlayers = 1;
            this.playGround();
        });

        playTwoPlayersBtn.addEventListener("click", () => {
            this.numberOfPlayers = 2;
            this.playGround();
        });

        playThreePlayersBtn.addEventListener("click", () => {
            this.numberOfPlayers = 3;
            this.playGround();
        });

        playFourPlayersBtn.addEventListener("click", () => {
            this.numberOfPlayers = 4;
            this.playGround();
        });

        this.fetchGameState();
        this.updatePodium();
        this.updateTurn();

        window.addEventListener("keypress", (e) => {
            if (e.code === "Enter" && superPlayButton.disabled === false && this.isGameOver === false) {
                this.playerRoll();
            }
        });

        const windowResize = () => {
            const boardWrapper = document.querySelector("#boardWrapper");
            if (boardWrapper) {
                this.scale = boardWrapper.clientWidth / 500;
                for (let player in this.players) {
                    this.players[player].setScale(this.scale);
                }
            }
        };

        window.addEventListener("resize", windowResize);

        this.updateTurn();
    }
}

const gameBoard = new GameBoard();
gameBoard.initializeGame();