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

    currentPlayer = 1; // Restablecer el turno al jugador 1
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
    // Primero, poner todas las cartas boca abajo
    handDom.innerHTML = '';
    hand.forEach((card, index) => {
        const img = document.createElement('img');
        img.setAttribute('src', isPlayer ? `images/${card.color}${card.value}.png` : 'images/back.png');
        img.setAttribute('id', index);
        handDom.appendChild(img);
    });

    // Luego, actualizar las cartas para mostrarlas correctamente
    setTimeout(() => {
        handDom.innerHTML = '';
        hand.forEach((card, index) => {
            const img = document.createElement('img');
            let imageName;
            if (card.color === 'wild') {
                imageName = `wild${card.value}.png`;
            } else {
                if (card.value >= 0 && card.value <= 12) {
                    imageName = `${card.color}${card.value}.png`;
                } else {
                    console.error('Valor de la carta no permitido:', card.value);
                    imageName = `wild${card.value}.png`;
                }
            }
            img.setAttribute('src', isPlayer ? `images/${imageName}` : 'images/back.png');
            img.setAttribute('id', index);
            if (isPlayer && handDom === playerHandDom) {
                img.addEventListener('click', () => playCard(index, playerHand));
            } else if (isPlayer && handDom === player2HandDom) {
                img.addEventListener('click', () => playCard(index, player2Hand));
            }
            handDom.appendChild(img);
        });
    });
};

// Función para jugar una carta (solo para jugadores)
const playCard = (index, hand) => {
    const cardToPlay = hand[index];
    const lastCard = playPile[playPile.length - 1];

    // Verificar si la carta seleccionada cumple con las reglas
    if (isValidPlay(cardToPlay, lastCard)) {
        if (cardToPlay.color === 'wild') {
            // Mostrar selector de color
            colorSelector.classList.remove('hidden');
            colorSelector.dataset.selectedCard = JSON.stringify(cardToPlay);
            // Eliminar la carta de la mano del jugador
            hand.splice(index, 1);
            updateHand(currentPlayer === 1 ? playerHandDom : player2HandDom, hand, true);
        } else {
            // Procesar la carta
            processCard(cardToPlay);
            playPile.push(hand.splice(index, 1)[0]); // Jugar la carta y eliminarla de la mano
            updatePlayPile();
            updateHand(currentPlayer === 1 ? playerHandDom : player2HandDom, hand, true);
            checkForWinner(); // Verificar si hay un ganador
            changeTurn();
        }

        // Verificar si el jugador tiene solo una carta
        if (hand.length === 1) {
            alert(`¡Jugador ${currentPlayer} dice UNO!`);
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
        updateHand(currentPlayer === 1 ? playerHandDom : player2HandDom, currentPlayer === 1 ? playerHand : player2Hand, true);
        document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
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
        skipNextPlayer = true; // En un juego de 2 jugadores, actúa como una carta de saltar turno
    } else if (card.value === '12') { // +2
        const nextPlayerHand = getNextPlayerHand();
        drawCard(nextPlayerHand, 2);
    } else if (card.value === '14') { // Comodín +4
        const nextPlayerHand = getNextPlayerHand();
        drawCard(nextPlayerHand, 4);
        skipNextPlayer = true; // El siguiente jugador pierde su turno
        if (currentPlayer !== 3) { // Si no es la CPU, mostrar selector de color
            colorSelector.classList.remove('hidden');
            colorSelector.dataset.selectedCard = JSON.stringify(card);
        } else {
            // Si es la CPU, seleccionar un color aleatorio
            const colors = ['red', 'green', 'blue', 'yellow'];
            const selectedColor = colors[Math.floor(Math.random() * colors.length)];
            playPile.push({ color: selectedColor, value: card.value }); // Añadir carta con nuevo color
            document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            updatePlayPile();
        }
    }
};

const getNextPlayerHand = () => {
    if (currentPlayer === 1) {
        return numberOfPlayers === 2 ? player2Hand : cpuHand;
    } else if (currentPlayer === 2) {
        return cpuHand;
    } else {
        return playerHand;
    }
};

// Función para robar cartas
const drawCard = (hand, count = 1) => {
    for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
            reshuffleDeck();
        }
        const card = deck.pop();
        hand.push(card);
    }
    updateHand(hand === playerHand ? playerHandDom : (hand === player2Hand ? player2HandDom : cpuHandDom), hand, true);
};

// Función para mezclar la pila de juego y convertirla en el nuevo mazo
const reshuffleDeck = () => {
    const lastCard = playPile.pop();
    deck = [...playPile];
    shuffleDeck(deck);
    playPile = [lastCard];
    updatePlayPile();
};

// Función para actualizar la pila de juego
const updatePlayPile = () => {
    const lastCard = playPile[playPile.length - 1];
    console.log("lastCard lastCard ", lastCard);
    console.log("lastCard lastCard color ", lastCard.color);
    console.log("lastCard lastCard value", lastCard.value);
    console.log( `${lastCard.color}${lastCard.value}.png`);
 
    let imageName;
    if (lastCard.color === 'wild') {
        imageName = `wild${lastCard.value}.png`;
    } else {
        if (lastCard.value >= 0 && lastCard.value <= 12) {
            imageName = `${lastCard.color}${lastCard.value}.png`;
        } else {
            //console.error('Valor de la carta no permitido:', card.value);
           // document.getElementById('currentColor').textContent = `Color actual: ${lastCard.color}`;
            imageName = `wild${lastCard.value}.png`;
        }
    }
    playPileDom.setAttribute('src', `images/${imageName}`);
    playPileDom.style.borderColor = lastCard.color; // Cambiar el borde al color seleccionado
};

// Función para cambiar el turno
const changeTurn = () => {
    if (skipNextPlayer) {
        skipNextPlayer = false; // Reiniciar la bandera de "pierde turno"
        currentPlayer = (currentPlayer === 1) ? 3 : (currentPlayer === 2 ? 1 : 2);
        updateTurnVisuals();
        if (currentPlayer === 3) {
            setTimeout(playCPU, 1000); // Si es el turno del CPU, juega después de un delay
        }
        return; // Salir después de saltar el turno
    }
    if (numberOfPlayers === 1) {
        currentPlayer = (currentPlayer === 1) ? 3 : 1;
    } else {
        currentPlayer = (currentPlayer === 1) ? 2 : (currentPlayer === 2 ? 3 : 1);
    }
    updateTurnVisuals();
    if (currentPlayer === 3) {
        setTimeout(playCPU, 1000); // Si es el turno del CPU, juega después de un delay
    }
};

// Función para actualizar la visualización de los turnos
const updateTurnVisuals = () => {
    if (currentPlayer === 1) {
        hideHand(player2HandDom);
        hideHand(cpuHandDom);
        showHand(playerHandDom, playerHand);
    } else if (currentPlayer === 2) {
        hideHand(playerHandDom);
        hideHand(cpuHandDom);
        showHand(player2HandDom, player2Hand);
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
            if (card.value >= 0 && card.value <= 12) {
                console.log(" ******* validar showHand ******* ", `images/${card.color}${card.value}.png`)
                img.setAttribute('src', `images/${card.color}${card.value}.png`);
            } else {
                img.setAttribute('src', `images/wild${card.value}.png`);
            }
           
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
    if (currentPlayer !== 3) return; // Asegurarse de que solo juegue cuando sea el turno del CPU

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

        if (cardToPlay.color === 'wild') {
            const colors = ['red', 'green', 'blue', 'yellow'];
            const selectedColor = colors[Math.floor(Math.random() * colors.length)];
            playPile.push({ color: selectedColor, value: cardToPlay.value }); // Añadir carta con nuevo color
            document.getElementById('currentColor').textContent = `Color actual: ${selectedColor}`;
            updatePlayPile();
        }

        checkForWinner(); // Verificar si hay un ganador
    } else {
        drawCard(cpuHand); // Robar una carta si no puede jugar
        updateHand(cpuHandDom, cpuHand, false);
    }

    // Verificar si la CPU tiene solo una carta
    if (cpuHand.length === 1) {
        alert("¡CPU dice UNO!");
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

//verificar si un jugador se ha quedado sin cartas
const checkForWinner = () => {
    if (playerHand.length === 0) {
        endRound(1);
    } else if (numberOfPlayers === 2 && player2Hand.length === 0) {
        endRound(2);
    } else if (cpuHand.length === 0) {
        endRound(3);
    }
};

//calcular los puntos de las cartas restantes
const calculatePoints = (hand) => {
    return hand.reduce((total, card) => {
        if (card.value === '13' || card.value === '14') {
            return total + 15; // Comodines valen 15 puntos
        } else if (['10', '11', '12'].includes(card.value)) {
            return total + 10; // Cartas especiales valen 10 puntos
        } else {
            return total + parseInt(card.value); // Cartas numéricas valen su número
        }
    }, 0);
};

//finalizar la ronda y actualizar el puntaje
const endRound = (winner) => {
    let points = 0;
    if (winner === 1) {
        points = calculatePoints(player2Hand) + calculatePoints(cpuHand);
        playerScore += points;
    } else if (winner === 2) {
        points = calculatePoints(playerHand) + calculatePoints(cpuHand);
        player2Score += points;
    } else if (winner === 3) {
        points = calculatePoints(playerHand) + calculatePoints(player2Hand);
        cpuScore += points;
    }

    // Actualizar los puntajes en el DOM
    player1ScoreDom.textContent = `Jugador 1: ${playerScore} puntos`;
    player2ScoreDom.textContent = `Jugador 2: ${player2Score} puntos`;
    cpuScoreDom.textContent = `CPU: ${cpuScore} puntos`;

    if (playerScore >= 100 || player2Score >= 100 || cpuScore >= 100) {
        alert(`Jugador ${winner} gana la partida con ${points} puntos! El juego se reiniciará.`);
        resetGame(); // Reiniciar el juego
    } else {
        alert(`Jugador ${winner} gana la ronda con ${points} puntos!`);
        startGame(); // Reiniciar la ronda
    }
};

//reiniciar juego
const resetGame = () => {
    playerScore = 0;
    player2Score = 0;
    cpuScore = 0;
    player1ScoreDom.textContent = `Jugador 1: ${playerScore} puntos`;
    player2ScoreDom.textContent = `Jugador 2: ${player2Score} puntos`;
    cpuScoreDom.textContent = `CPU: ${cpuScore} puntos`;
    startGame(); // Iniciar una nueva partida
};

// Iniciar el juego al cargar la página
startGame();
