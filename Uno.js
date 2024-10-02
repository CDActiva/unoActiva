let numberOfPlayers = 1; // Por defecto, 1 jugador

// Elementos del DOM
const playerHandDom = document.getElementById('playerHand');
const player2HandDom = document.getElementById('player2Hand');
const cpuHandDom = document.querySelector('.cpu-hand');
const playPileDom = document.getElementById('playPile');
const drawPileDom = document.getElementById('drawPile');
const colorSelector = document.getElementById('color-selector');

// Marcadores de puntaje
let playerScore = 0;
let player2Score = 0;
let cpuScore = 0;

const player1ScoreDom = document.getElementById('player1-score');
const player2ScoreDom = document.getElementById('player2-score');
const cpuScoreDom = document.getElementById('cpu-score');

// Arrays para las manos de cada jugador
const playerHand = [];
const player2Hand = [];
const cpuHand = [];

// Variables del juego
let currentPlayer = 1;
let deck = [];
let playPile = [];
let drawPile = [];
let skipNextPlayer = false;
let newColor = '';

// Selección del número de jugadores
document.getElementById("onePlayer").addEventListener("click", () => {
    numberOfPlayers = 1;
    player2ScoreDom.classList.add('hidden');
    document.querySelector('.player2-box').classList.add('hidden');
    startGame();
});

document.getElementById("twoPlayers").addEventListener("click", () => {
    numberOfPlayers = 2;
    player2ScoreDom.classList.remove('hidden');
    document.querySelector('.player2-box').classList.remove('hidden');
    startGame();
});

// Función para inicializar el juego
const startGame = () => {
    playerHand.length = 0;
    player2Hand.length = 0;
    cpuHand.length = 0;
    deck = createDeck();
    shuffleDeck(deck);
    dealCards();

    currentPlayer = 1;
    skipNextPlayer = false; // Resetear el skip al iniciar el juego
    updateTurnVisuals();
};

// Función para crear el mazo
const createDeck = () => {
    let colors = ['red', 'green', 'blue', 'yellow'];
    let deck = [];
    colors.forEach(color => {
        for (let i = 0; i <= 9; i++) {
            deck.push({ color, value: i.toString() }); // Cambiar a string
        }
        deck.push({ color, value: '11' }); // Pierdes el turno
        deck.push({ color, value: '10' }); // Cambio de dirección
        deck.push({ color, value: '12' }); // +2
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: '13' }); // Comodín
        deck.push({ color: 'wild', value: '14' }); // Comodín +4
    }
    return deck;
};

// Función para mezclar la baraja
const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
};

// Función para repartir las cartas
const dealCards = () => {
    for (let i = 0; i < 7; i++) {
        playerHand.push(deck.shift());
        cpuHand.push(deck.shift());
        if (numberOfPlayers === 2) {
            player2Hand.push(deck.shift());
        }
    }
    updateHand(playerHandDom, playerHand, true);
    updateHand(cpuHandDom, cpuHand, false);
    if (numberOfPlayers === 2) {
        updateHand(player2HandDom, player2Hand, true);
    }
    playPile = [deck.shift()]; // Carta inicial en la pila de juego
    drawPile = deck; // El resto de la baraja es el mazo
    updatePlayPile();
};

// Función para actualizar las manos en el DOM
const updateHand = (handDom, hand, isPlayer) => {
    handDom.innerHTML = '';
    hand.forEach((card, index) => {
        const img = document.createElement('img');
        img.setAttribute('src', isPlayer ? `images/${card.color}${card.value}.png` : 'images/back.png');
        img.setAttribute('id', index);
        if (isPlayer && handDom === playerHandDom) {
            img.addEventListener('click', () => playCard(index, playerHand));
        } else if (isPlayer && handDom === player2HandDom) {
            img.addEventListener('click', () => playCard(index, player2Hand));
        }
        handDom.appendChild(img);
    });
};

// Función para jugar una carta (solo para jugadores)
const playCard = (index, hand) => {
    const cardToPlay = hand[index];
    const lastCard = playPile[playPile.length - 1];

    // Verificar si la carta seleccionada cumple con las reglas
    if (isValidPlay(cardToPlay, lastCard)) {
        if (cardToPlay.value === '13' || cardToPlay.value === '14') {
            // Mostrar selector de color
            colorSelector.classList.remove('hidden');
            colorSelector.dataset.selectedCard = JSON.stringify(cardToPlay);
        } else {
            // Procesar la carta
            processCard(cardToPlay);
            playPile.push(hand.splice(index, 1)[0]); // Jugar la carta
            updatePlayPile();
            updateHand(currentPlayer === 1 ? playerHandDom : player2HandDom, hand, true);
            changeTurn();
        }
    } else {
        alert("No puedes jugar esa carta.");
    }
};

// Selección de color
document.querySelectorAll('.color-button').forEach(button => {
    button.addEventListener('click', () => {
        const selectedColor = button.dataset.color;
        const selectedCard = JSON.parse(colorSelector.dataset.selectedCard);
        playPile.push({ color: selectedColor, value: selectedCard.value }); // Añadir carta con nuevo color
        colorSelector.classList.add('hidden');
        updatePlayPile();
        updateHand(playerHandDom, playerHand, true);
        changeTurn();
    });
});

// Verifica si la carta jugada es válida
const isValidPlay = (card, lastCard) => {
    return card.color === lastCard.color || card.value === lastCard.value || card.color === 'wild';
};

// Función para procesar cartas especiales
const processCard = (card) => {
    if (card.value === '11') { // Pierdes el turno
        skipNextPlayer = true;
    } else if (card.value === '10') { // Cambio de dirección
        currentPlayer = (currentPlayer === 1) ? (numberOfPlayers === 2 ? 2 : 3) : (currentPlayer === 2 ? 1 : 2);
    } else if (card.value === '12') { // +2
        const nextPlayerHand = (currentPlayer === 1) ? (numberOfPlayers === 2 ? player2Hand : cpuHand) : cpuHand;
        drawCard(nextPlayerHand, 2);
    } else if (card.value === '14') { // Comodín +4
        const nextPlayerHand = (currentPlayer === 1) ? (numberOfPlayers === 2 ? player2Hand : cpuHand) : cpuHand;
        drawCard(nextPlayerHand, 4);
        skipNextPlayer = true; // El siguiente jugador pierde su turno
        colorSelector.classList.remove('hidden'); // Mostrar selector de color
        colorSelector.dataset.selectedCard = JSON.stringify(card);
    }
};

// Función para robar cartas
const drawCard = (hand, num = 1) => {
    for (let i = 0; i < num; i++) {
        if (drawPile.length > 0) {
            hand.push(drawPile.shift());
        } else {
            alert('No hay más cartas en el mazo.');
            break;
        }
    }
};

// Función para actualizar la pila de juego
const updatePlayPile = () => {
    const lastCard = playPile[playPile.length - 1];
    const imageName = lastCard.color === 'wild' ? `${lastCard.value}.png` : `${lastCard.color}${lastCard.value}.png`;
    playPileDom.setAttribute('src', `images/${imageName}`);
};

// Función para cambiar el turno
const changeTurn = () => {
    if (skipNextPlayer) {
        skipNextPlayer = false; // Reiniciar la bandera de "pierde turno"
        return; // Salir sin cambiar el turno
    }
    if (numberOfPlayers === 1) {
        currentPlayer = (currentPlayer === 1) ? 3 : 1;
    } else {
        currentPlayer = (currentPlayer === 1) ? 2 : (currentPlayer === 2 ? 3 : 1);
    }
    updateTurnVisuals();
};

// Función para actualizar la visualización de los turnos
const updateTurnVisuals = () => {
    if (currentPlayer === 1) {
        showHand(playerHandDom, playerHand);
        hideHand(player2HandDom);
        hideHand(cpuHandDom);
    } else if (currentPlayer === 2) {
        showHand(player2HandDom, player2Hand);
        hideHand(playerHandDom);
        hideHand(cpuHandDom);
    } else if (currentPlayer === 3) {
        hideHand(playerHandDom);
        hideHand(player2HandDom);
        showHand(cpuHandDom, cpuHand);
        playCPU();
    }
};

// Función para mostrar las cartas de la mano
const showHand = (handDom, hand) => {
    hand.forEach((card, index) => {
        const img = handDom.querySelector(`[id="${index}"]`);
        if (img) {
            img.setAttribute('src', `images/${card.color}${card.value}.png`);
        }
    });
};

// Función para ocultar las cartas de la mano (volteadas)
const hideHand = (handDom) => {
    const cards = handDom.querySelectorAll('img');
    cards.forEach(card => {
        card.setAttribute('src', 'images/back.png');
    });
};

// Lógica del CPU
const playCPU = () => {
    console.log('CPU jugando...');
    const playableCards = cpuHand.filter(card => isValidPlay(card, playPile[playPile.length - 1]));

    if (playableCards.length > 0) {
        const cardToPlay = playableCards[0]; // Juega la primera carta que puede
        const index = cpuHand.indexOf(cardToPlay);
        cpuHand.splice(index, 1); // Eliminar de la mano del CPU
        processCard(cardToPlay);
        playPile.push(cardToPlay); // Añadir a la pila de juego
        updatePlayPile();
        updateHand(cpuHandDom, cpuHand, false);
    } else {
        drawCard(cpuHand); // Robar una carta si no puede jugar
        updateHand(cpuHandDom, cpuHand, false);
    }

    setTimeout(changeTurn, 1000); // Cambiar turno después de un delay
};

// Función para coger una carta del mazo
drawPileDom.addEventListener('click', () => {
    if (currentPlayer === 1) {
        drawCard(playerHand);
        updateHand(playerHandDom, playerHand, true);
        changeTurn();
    } else if (currentPlayer === 2) {
        drawCard(player2Hand);
        updateHand(player2HandDom, player2Hand, true);
        changeTurn();
    }
});

// Iniciar el juego al cargar la página
startGame();