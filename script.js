// Get references to HTML elements
const cupsContainer = document.querySelector('.cups-container');
// ✅ ИСПРАВЛЕНИЕ: Используем 'let', чтобы можно было обновить список кубков после shuffle
let cups = document.querySelectorAll('.cup'); 
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const shuffleButton = document.getElementById('shuffleButton');
const resetButton = document.getElementById('resetButton');
const messageDisplay = document.getElementById('message');

let score = 0;
let level = 1;
let sphinxPosition = 0; 
let isShuffling = false; 
let isGameReadyToStart = false; 

let activeGameTimeoutId = null; 

// --- Helper Functions ---

function clearSelections() {
    cups.forEach(cup => cup.classList.remove('selected'));
    const cupWithSphinx = document.querySelector('.cup .sphinx');
    if (cupWithSphinx) {
        cupWithSphinx.parentNode.classList.remove('selected');
    }
}

function cancelActiveTimeout() {
    if (activeGameTimeoutId !== null) {
        clearTimeout(activeGameTimeoutId);
        activeGameTimeoutId = null;
    }
}

// ✅ НОВАЯ УТИЛИТА: Устанавливает все стили и принудительно перезагружает GIF
function setSphinxStylesAndRestartAnimation(sphinxElement) {
    if (!sphinxElement) return;

    // Включаем все стили и уникальный URL для перезапуска GIF
    sphinxElement.style.cssText = `
        position: absolute;
        bottom: 20px; 
        left: 50%;
        transform: translateX(-50%);
        width: 180px; 
        height: 180px; 
        background-size: contain; 
        background-repeat: no-repeat;
        background-position: center bottom; 
        z-index: 2;
        transition: opacity 0.6s ease-out;
        
        /* Кэш-бастер для принудительной перезагрузки GIF */
        background-image: url('images/cat.gif?v=${Date.now()}');
    `;
}

// --- Game Functions ---

// 1. Create and place the sphinx
function placeSphinx() {
    clearSelections(); 

    const previouslyLifted = document.querySelector('.cup.lift-up');
    if (previouslyLifted) {
        previouslyLifted.classList.remove('lift-up');
    }

    const oldSphinx = document.querySelector('.sphinx');
    if (oldSphinx) {
        oldSphinx.classList.add('hidden'); 
        oldSphinx.remove();
    }

    cups = document.querySelectorAll('.cup');

    sphinxPosition = Math.floor(Math.random() * cups.length);

    // Create the sphinx element
    const sphinx = document.createElement('div');
    sphinx.classList.add('sphinx');
    
    // Устанавливаем стили и перезапускаем анимацию при создании
    setSphinxStylesAndRestartAnimation(sphinx);
    
    sphinx.classList.add('hidden'); 
    
    // Place the sphinx under the chosen cup
    cups[sphinxPosition].appendChild(sphinx);
}

// 2. Function to shuffle the cups
async function shuffleCups() {
    cancelActiveTimeout(); 
    
    isShuffling = true;
    isGameReadyToStart = false; 
    messageDisplay.textContent = 'The sphinx is hiding...';
    shuffleButton.disabled = true;
    
    clearSelections(); 
    const actualSphinx = document.querySelector('.sphinx');
    if (actualSphinx) {
         actualSphinx.classList.add('hidden');
    }

    // Удаляем обработчики кликов с кубков до перемешивания
    cups.forEach(cup => cup.removeEventListener('click', handleCupClick));


    // --- Cup shuffling logic ---
    let currentOrder = Array.from(cups);
    for (let i = currentOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
    }

    cupsContainer.innerHTML = '';
    currentOrder.forEach(cup => cupsContainer.appendChild(cup));

    // ✅ ИСПРАВЛЕНИЕ: Обновляем список кубков после перестроения DOM
    cups = document.querySelectorAll('.cup'); 

    messageDisplay.textContent = 'Where is the sphinx? Choose a cup!';
    
    // Назначаем обработчики кликов только после завершения перемешивания
    cups.forEach(cup => {
        cup.addEventListener('click', handleCupClick);
    });

    isShuffling = false; 
    isGameReadyToStart = true; 
}

// 3. Click handler for a cup
function handleCupClick(event) {
    if (isShuffling) return; 

    if (!isGameReadyToStart) {
        messageDisplay.textContent = 'Please click "Shuffle!" to start the round!';
        return; 
    }

    isShuffling = true; 
    isGameReadyToStart = false; 

    const clickedCup = event.currentTarget;

    cups.forEach(cup => cup.classList.remove('selected'));
    
    const actualSphinx = document.querySelector('.sphinx');
    if (actualSphinx) {
        actualSphinx.classList.remove('hidden'); 
        actualSphinx.parentNode.classList.add('selected'); 
        
        // Принудительно перезапускаем анимацию, когда сфинкс становится видимым
        setSphinxStylesAndRestartAnimation(actualSphinx);
    }
    

    cups.forEach(cup => cup.removeEventListener('click', handleCupClick));


    if (clickedCup.querySelector('.sphinx')) {
        // Победа
        score++;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'Congratulations, you found the sphinx! 🎉';
        level++;
        levelDisplay.textContent = level;
        
        shuffleButton.disabled = false; 
        
        activeGameTimeoutId = setTimeout(() => {
            if (!isShuffling) {
                messageDisplay.textContent = 'Get ready for the next stage! Click "Shuffle!"';
                placeSphinx(); 
                isShuffling = false; 
                isGameReadyToStart = false; 
            }
            activeGameTimeoutId = null;
        }, 3000); 
    } else {
        // Проигрыш
        messageDisplay.textContent = 'Alas, the sphinx hid elsewhere! 😞';
        
        resetButton.style.display = 'inline-block';
        
        activeGameTimeoutId = setTimeout(() => {
            if (!isShuffling) {
                clearSelections(); 
                const actualSphinxToHide = document.querySelector('.sphinx');
                if(actualSphinxToHide) {
                    actualSphinxToHide.classList.add('hidden');
                }
                shuffleButton.disabled = true; 
                isShuffling = false;
                isGameReadyToStart = false;
            }
            activeGameTimeoutId = null;
        }, 3000); 
    }
}

// 4. Function to reset the game
function resetGame() {
    cancelActiveTimeout();
    
    score = 0;
    level = 1;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    
    clearSelections(); 
    cups.forEach(cup => {
        cup.classList.remove('lift-up');
    });
    
    messageDisplay.textContent = 'Click "Shuffle!" to start a new game!';
    placeSphinx(); 
    
    cups = document.querySelectorAll('.cup'); 
    cups.forEach(cup => {
        cup.removeEventListener('click', handleCupClick); 
    });
    
    shuffleButton.disabled = false;
    resetButton.style.display = 'none';
    isShuffling = false; 
    isGameReadyToStart = false; 
}

// --- Game Initialization ---
function initGame() {
    cups = document.querySelectorAll('.cup'); 

    messageDisplay.textContent = 'Ready to play! Click "Shuffle!" to begin!';
    placeSphinx(); 
    
    shuffleButton.addEventListener('click', () => {
        clearSelections(); 
        shuffleCups(); 
    });

    resetButton.addEventListener('click', resetGame);
    
    cups.forEach(cup => cup.removeEventListener('click', handleCupClick));

    isShuffling = false; 
    isGameReadyToStart = false;
}

// Run the game initialization when the page is fully loaded
document.addEventListener('DOMContentLoaded', initGame);