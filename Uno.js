// Constantes y variables globales
const COLORS = ['red', 'green', 'blue', 'yellow'];
const SPECIAL_CARDS = {
    SKIP: '11',
    REVERSE: '10',
    DRAW_TWO: '12',
    WILD: '13',
    WILD_DRAW_FOUR: '14'
};

let gameState = {
    numberOfPlayers: 1,
    currentPlayer: 1,
    skipNextPlayer: false,
    playerHand: [],
    player2Hand: [],
    cpuHand: [],
    playPile: [],
    drawPile: [],
    playerScore: 0,
    player2Score: 0,
    cpuScore: 0
};

// Elementos del DOM
const domElements = {
    playerHandDom: document.getElementById('playerHand'),
    player2HandDom: document.getElementById('player2Hand'),
    cpuHandDom: document.querySelector('.cpu-hand'),
    playPileDom: document.getElementById('playPile'),
    drawPileDom: document.getElementById('drawPile'),
    colorSelector: document.getElementById('color-selector'),
    player1ScoreDom: document.getElementById('player1-score'),
    player2ScoreDom: document.getElementById('player2-score'),
    cpuScoreDom: document.getElementById('cpu-score')
};

// Funciones de inicialización
function initializeGame() {
    document.getElementById("onePlayer").addEventListener("click", () => setNumberOfPlayers(1));
    document.getElementById("twoPlayers").addEventListener("click", () => setNumberOfPlayers(2));
    domElements.drawPileDom.addEventListener('click', handleDrawCard);
    initializeColorSelector();
    startGame();
}

function setNumberOfPlayers(num) {
    gameState.numberOfPlayers = num;
    domElements.player2ScoreDom.classList.toggle('hidden', num === 1);
    document.querySelector('.player2-box').classList.toggle('hidden', num === 1);
    startGame();
}

function startGame() {
    gameState = {
        ...gameState,
        currentPlayer: 1,
        skipNextPlayer: false,
        playerHand: [],
        player2Hand: [],
        cpuHand: [],
        playPile: [],
        drawPile: []
    };
    
    const deck = createAndShuffleDeck();
    dealCards(deck);
    updateAllHands();
    updatePlayPile();
    updateTurnVisuals();
}

// Funciones de creación y manejo de cartas
function createAndShuffleDeck() {
    const deck = createDeck();
    shuffleDeck(deck);
    return deck;
}

function createDeck() {
    let deck = [];
    COLORS.forEach(color => {
        for (let i = 0; i <= 9; i++) {
            deck.push({ color, value: i.toString() });
        }
        deck.push({ color, value: SPECIAL_CARDS.SKIP });
        deck.push({ color, value: SPECIAL_CARDS.REVERSE });
        deck.push({ color, value: SPECIAL_CARDS.DRAW_TWO });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: SPECIAL_CARDS.WILD });
        deck.push({ color: 'wild', value: SPECIAL_CARDS.WILD_DRAW_FOUR });
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards(deck) {
    for (let i = 0; i < 7; i++) {
        gameState.playerHand.push(deck.shift());
        gameState.cpuHand.push(deck.shift());
        if (gameState.numberOfPlayers === 2) {
            gameState.player2Hand.push(deck.shift());
        }
    }
    gameState.playPile = [deck.shift()];
    gameState.drawPile = deck;
}

// Funciones de actualización de interfaz
function updateAllHands() {
    updateHand(domElements.playerHandDom, gameState.playerHand, gameState.currentPlayer === 1);
    updateHand(domElements.cpuHandDom, gameState.cpuHand, false);
    if (gameState.numberOfPlayers === 2) {
        updateHand(domElements.player2HandDom, gameState.player2Hand, gameState.currentPlayer === 2);
    }
}

function updateHand(handDom, hand, isCurrentPlayer) {
    handDom.innerHTML = '';
    hand.forEach((card, index) => {
        const img = document.createElement('img');
        img.src = getCardImagePath(card, isCurrentPlayer);
        img.id = index;
        if (isCurrentPlayer) {
            img.addEventListener('click', () => playCard(index, hand));
        }
        handDom.appendChild(img);
    });
}

function getCardImagePath(card, isCurrentPlayer) {
    if (!isCurrentPlayer) return 'images/back.png';
    return card.color === 'wild' ? `images/wild${card.value}.png` : `images/${card.color}${card.value}.png`;
}

function updateTurnVisuals() {
    updateAllHands();
    
    if (gameState.currentPlayer === 3) {
        setTimeout(playCPU, 1000);
    }
}

// Lógica del juego
function playCard(index, hand) {
    const cardToPlay = hand[index];
    const lastCard = gameState.playPile[gameState.playPile.length - 1];

    if (isValidPlay(cardToPlay, lastCard)) {
        if (cardToPlay.color === 'wild') {
            showColorSelector(cardToPlay, index, hand);
        } else {
            executeCardPlay(cardToPlay, index, hand);
        }
    } else {
        alert("No puedes jugar esa carta.");
    }
}

function isValidPlay(card, lastCard) {
    return card.color === lastCard.color || card.value === lastCard.value || card.color === 'wild';
}

function executeCardPlay(cardToPlay, index, hand) {
    processCard(cardToPlay);
    gameState.playPile.push(hand.splice(index, 1)[0]);
    updatePlayPile();
    updateHand(getCurrentPlayerHandDom(), hand, true);
    checkForWinner();
    changeTurn();
}

function processCard(card) {
    switch(card.value) {
        case SPECIAL_CARDS.SKIP:
        case SPECIAL_CARDS.REVERSE:
            gameState.skipNextPlayer = true;
            break;
        case SPECIAL_CARDS.DRAW_TWO:
            drawCard(getNextPlayerHand(), 2);
            break;
        case SPECIAL_CARDS.WILD_DRAW_FOUR:
            drawCard(getNextPlayerHand(), 4);
            gameState.skipNextPlayer = true;
            break;
    }
}

function changeTurn() {
    if (gameState.skipNextPlayer) {
        gameState.skipNextPlayer = false;
        gameState.currentPlayer = getNextPlayer(getNextPlayer(gameState.currentPlayer));
    } else {
        gameState.currentPlayer = getNextPlayer(gameState.currentPlayer);
    }
    updateTurnVisuals();
}

function getNextPlayer(player) {
    if (gameState.numberOfPlayers === 1) {
        return player === 1 ? 3 : 1;
    }
    return player === 1 ? 2 : (player === 2 ? 3 : 1);
}

function getCurrentPlayerHandDom() {
    switch(gameState.currentPlayer) {
        case 1: return domElements.playerHandDom;
        case 2: return domElements.player2HandDom;
        case 3: return domElements.cpuHandDom;
    }
}

function getCurrentPlayerHand() {
    switch(gameState.currentPlayer) {
        case 1: return gameState.playerHand;
        case 2: return gameState.player2Hand;
        case 3: return gameState.cpuHand;
    }
}

function getNextPlayerHand() {
    const nextPlayer = getNextPlayer(gameState.currentPlayer);
    return nextPlayer === 1 ? gameState.playerHand : (nextPlayer === 2 ? gameState.player2Hand : gameState.cpuHand);
}

function drawCard(hand, count = 1) {
    for (let i = 0; i < count; i++) {
        if (gameState.drawPile.length === 0) {
            reshuffleDeck();
        }
        hand.push(gameState.drawPile.pop());
    }
    updateHand(getCurrentPlayerHandDom(), hand, gameState.currentPlayer !== 3);
}

function reshuffleDeck() {
    const lastCard = gameState.playPile.pop();
    gameState.drawPile = [...gameState.playPile];
    shuffleDeck(gameState.drawPile);
    gameState.playPile = [lastCard];
    updatePlayPile();
}

function handleDrawCard() {
    if (gameState.currentPlayer !== 3) {
        drawCard(getCurrentPlayerHand());
        changeTurn();
    }
}

// Lógica de la CPU
function playCPU() {
    if (gameState.currentPlayer !== 3) return;

    const playableCards = gameState.cpuHand.filter(card => isValidPlay(card, gameState.playPile[gameState.playPile.length - 1]));

    if (playableCards.length > 0) {
        const cardToPlay = playableCards[0];
        const index = gameState.cpuHand.indexOf(cardToPlay);
        executeCardPlay(cardToPlay, index, gameState.cpuHand);

        if (cardToPlay.color === 'wild') {
            const selectedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            gameState.playPile[gameState.playPile.length - 1].color = selectedColor;
            document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            updatePlayPile();
        }
    } else {
        drawCard(gameState.cpuHand);
    }

    if (gameState.cpuHand.length === 1) {
        alert("¡CPU dice UNO!");
    }

    setTimeout(changeTurn, 1000);
}

// Manejo de fin de juego
function checkForWinner() {
    const currentHand = getCurrentPlayerHand();
    if (currentHand.length === 0) {
        endRound(gameState.currentPlayer);
    }
}

function endRound(winner) {
    const points = calculatePoints(gameState.playerHand) + calculatePoints(gameState.player2Hand) + calculatePoints(gameState.cpuHand);
    
    switch(winner) {
        case 1:
            gameState.playerScore += points;
            break;
        case 2:
            gameState.player2Score += points;
            break;
        case 3:
            gameState.cpuScore += points;
            break;
    }

    updateScores();

    if (gameState.playerScore >= 100 || gameState.player2Score >= 100 || gameState.cpuScore >= 100) {
        alert(`Jugador ${winner} gana la partida con ${points} puntos! El juego se reiniciará.`);
        resetGame();
    } else {
        alert(`Jugador ${winner} gana la ronda con ${points} puntos!`);
        startGame();
    }
}

function calculatePoints(hand) {
    return hand.reduce((total, card) => {
        if (card.value === SPECIAL_CARDS.WILD || card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
            return total + 15;
        } else if (card.value === SPECIAL_CARDS.SKIP || card.value === SPECIAL_CARDS.REVERSE || card.value === SPECIAL_CARDS.DRAW_TWO) {
            return total + 10;
        } else {
            return total + parseInt(card.value);
        }
    }, 0);
}

function updateScores() {
    domElements.player1ScoreDom.textContent = `Jugador 1: ${gameState.playerScore} puntos`;
    domElements.player2ScoreDom.textContent = `Jugador 2: ${gameState.player2Score} puntos`;
    domElements.cpuScoreDom.textContent = `CPU: ${gameState.cpuScore} puntos`;
}

function resetGame() {
    gameState.playerScore = 0;
    gameState.player2Score = 0;
    gameState.cpuScore = 0;
    updateScores();
    startGame();
}

// Funciones para el selector de color
function initializeColorSelector() {
    document.querySelectorAll('.color-button').forEach(button => {
        button.addEventListener('click', handleColorSelection);
    });
}

function showColorSelector(cardToPlay, index, hand) {
    domElements.colorSelector.classList.remove('hidden');
    domElements.colorSelector.dataset.selectedCard = JSON.stringify(cardToPlay);
    domElements.colorSelector.dataset.cardIndex = index;
    domElements.colorSelector.dataset.currentHand = hand === gameState.playerHand ? 'player' : 'player2';
}

function handleColorSelection(event) {
    const selectedColor = event.target.dataset.color;
    const cardData = JSON.parse(domElements.colorSelector.dataset.selectedCard);
    const index = parseInt(domElements.colorSelector.dataset.cardIndex);
    const hand = domElements.colorSelector.dataset.currentHand === 'player' ? gameState.playerHand : gameState.player2Hand;

    cardData.color = selectedColor;
    gameState.playPile.push(cardData);
    hand.splice(index, 1);

    updatePlayPile();
    updateHand(getCurrentPlayerHandDom(), hand, true);
    document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
    domElements.colorSelector.classList.add('hidden');

    checkForWinner();
    changeTurn();
}

// Mejoras en la lógica del juego
function isValidPlay(card, lastCard) {
    return card.color === lastCard.color || 
           card.value === lastCard.value || 
           card.color === 'wild' ||
           (lastCard.color === 'wild' && card.color === gameState.currentColor);
}

function executeCardPlay(cardToPlay, index, hand) {
    processCard(cardToPlay);
    gameState.playPile.push(hand.splice(index, 1)[0]);
    updatePlayPile();
    updateAllHands();
    
    if (hand.length === 1) {
        alert(`¡Jugador ${gameState.currentPlayer} dice UNO!`);
    }
    
    checkForWinner();
    if (gameState.currentPlayer !== 3) {
        changeTurn();
    }
}

function processCard(card) {
    switch(card.value) {
        case SPECIAL_CARDS.SKIP:
        case SPECIAL_CARDS.REVERSE:
            gameState.skipNextPlayer = true;
            break;
        case SPECIAL_CARDS.DRAW_TWO:
            drawCard(getNextPlayerHand(), 2);
            gameState.skipNextPlayer = true;
            break;
        case SPECIAL_CARDS.WILD_DRAW_FOUR:
            if (gameState.currentPlayer !== 3) {
                showColorSelector(card, -1, getCurrentPlayerHand());
            } else {
                const selectedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                gameState.currentColor = selectedColor;
                document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            }
            drawCard(getNextPlayerHand(), 4);
            gameState.skipNextPlayer = true;
            break;
        case SPECIAL_CARDS.WILD:
            if (gameState.currentPlayer !== 3) {
                showColorSelector(card, -1, getCurrentPlayerHand());
            } else {
                const selectedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                gameState.currentColor = selectedColor;
                document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            }
            break;
    }
}

// Mejoras en la lógica de la CPU
function playCPU() {
    if (gameState.currentPlayer !== 3) return;

    console.log('CPU jugando...');
    const playableCards = gameState.cpuHand.filter(card => isValidPlay(card, gameState.playPile[gameState.playPile.length - 1]));

    if (playableCards.length > 0) {
        const cardToPlay = playableCards[0];
        const index = gameState.cpuHand.indexOf(cardToPlay);
        executeCardPlay(cardToPlay, index, gameState.cpuHand);

        if (cardToPlay.color === 'wild') {
            const selectedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            gameState.currentColor = selectedColor;
            document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            updatePlayPile();
        }
    } else {
        drawCard(gameState.cpuHand);
    }

    updateAllHands();
    setTimeout(changeTurn, 1000);
}

// Funciones de actualización mejoradas
function updatePlayPile() {
    const lastCard = gameState.playPile[gameState.playPile.length - 1];
    domElements.playPileDom.src = getCardImagePath(lastCard, true);
    domElements.playPileDom.style.borderColor = lastCard.color !== 'wild' ? lastCard.color : gameState.currentColor;
    document.getElementById('currentColor').textContent = `Color actual: ${lastCard.color !== 'wild' ? lastCard.color : gameState.currentColor}`;
}

function updateScores() {
    domElements.player1ScoreDom.textContent = `Jugador 1: ${gameState.playerScore} puntos`;
    domElements.player2ScoreDom.textContent = `Jugador 2: ${gameState.player2Score} puntos`;
    domElements.cpuScoreDom.textContent = `CPU: ${gameState.cpuScore} puntos`;
}

// Inicialización del juego mejorada
function initializeGame() {
    document.getElementById("onePlayer").addEventListener("click", () => setNumberOfPlayers(1));
    document.getElementById("twoPlayers").addEventListener("click", () => setNumberOfPlayers(2));
    domElements.drawPileDom.addEventListener('click', handleDrawCard);
    initializeColorSelector();
    resetGame();
}

// Llamada inicial
initializeGame();
