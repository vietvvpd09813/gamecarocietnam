// Connect to the server using Socket.io
const socket = io();

// Game state variables
let currentRoom = null;
let playerSymbol = null;
let currentTurn = null;
let gameBoard = null;
let gameOver = false;

// DOM elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    createRoom: document.getElementById('create-room-screen'),
    joinRoom: document.getElementById('join-room-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen')
};

// UI elements
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const newRoomIdInput = document.getElementById('new-room-id');
const generateRoomIdBtn = document.getElementById('generate-room-id');
const createRoomConfirmBtn = document.getElementById('create-room-confirm');
const createRoomBackBtn = document.getElementById('create-room-back');
const roomIdInput = document.getElementById('room-id-input');
const joinRoomConfirmBtn = document.getElementById('join-room-confirm');
const joinRoomBackBtn = document.getElementById('join-room-back');
const roomIdDisplay = document.getElementById('room-id-display');
const copyRoomIdBtn = document.getElementById('copy-room-id');
const leaveRoomBtn = document.getElementById('leave-room');
const gameRoomId = document.getElementById('game-room-id');
const turnIcon = document.getElementById('turn-icon');
const turnMessage = document.getElementById('turn-message');
const playerXStatus = document.getElementById('player-x-status');
const playerOStatus = document.getElementById('player-o-status');
const gameBoard_UI = document.getElementById('game-board');
const restartGameBtn = document.getElementById('restart-game');
const exitGameBtn = document.getElementById('exit-game');
const gameResult = document.getElementById('game-result');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again');
const toastContainer = document.getElementById('toast-container');

// Show active screen
function showScreen(screenId) {
    // First hide all screens with animation
    Object.values(screens).forEach(screen => {
        if (screen.id !== screenId && !screen.classList.contains('hidden')) {
            screen.classList.add('screen-exit');
            setTimeout(() => {
                screen.classList.add('hidden');
                screen.classList.remove('screen-exit');
            }, 300);
        }
    });

    // Show the target screen with animation
    setTimeout(() => {
        screens[screenId].classList.remove('hidden');
        screens[screenId].classList.add('screen-enter');
        setTimeout(() => {
            screens[screenId].classList.remove('screen-enter');
        }, 400);
    }, 300);
}

// Generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle mr-3 text-green-500 text-xl"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle mr-3 text-red-500 text-xl"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle mr-3 text-blue-500 text-xl"></i>';
    }
    
    toast.innerHTML = `
        <div class="flex items-start">
            ${icon}
            <div>
                <p>${message}</p>
            </div>
        </div>
        <button class="ml-auto -mt-0.5 text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
        toast.classList.add('toast-visible');
    }, 10);
    
    // Set up close button
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('toast-visible');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toast.classList.remove('toast-visible');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }, 5000);
}

// Update turn display
function updateTurnDisplay() {
    if (gameOver) return;
    
    turnIcon.classList.remove('bg-blue-100', 'bg-red-100');
    turnIcon.innerHTML = '';
    
    if (currentTurn === 'X') {
        turnIcon.classList.add('bg-blue-100');
        turnIcon.innerHTML = '<span class="text-blue-700">X</span>';
        turnMessage.textContent = playerSymbol === 'X' ? 'Lượt của bạn' : 'Lượt đối thủ';
    } else {
        turnIcon.classList.add('bg-red-100');
        turnIcon.innerHTML = '<span class="text-red-700">O</span>';
        turnMessage.textContent = playerSymbol === 'O' ? 'Lượt của bạn' : 'Lượt đối thủ';
    }
    
    // Highlight current player's status
    playerXStatus.classList.toggle('bg-blue-100', currentTurn === 'X');
    playerOStatus.classList.toggle('bg-red-100', currentTurn === 'O');
}

// Update player status display
function updatePlayerStatus() {
    if (playerSymbol === 'X') {
        playerXStatus.textContent = 'Bạn';
        playerOStatus.textContent = 'Đối thủ';
    } else {
        playerXStatus.textContent = 'Đối thủ';
        playerOStatus.textContent = 'Bạn';
    }
}

// Render game board
function renderBoard() {
    gameBoard_UI.innerHTML = '';
    
    // Thêm một container để bọc bảng
    const boardWrapper = document.createElement('div');
    boardWrapper.style.display = 'grid';
    boardWrapper.style.gridTemplateColumns = 'repeat(15, minmax(30px, 1fr))';
    boardWrapper.style.width = '100%';
    
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = '100%';
            cell.style.height = '100%';
            
            if (gameBoard[row][col]) {
                cell.classList.add(gameBoard[row][col] === 'X' ? 'cell-x' : 'cell-o');
                cell.textContent = gameBoard[row][col];
            }
            
            // Add click event for empty cells
            if (!gameBoard[row][col] && !gameOver && currentTurn === playerSymbol) {
                cell.addEventListener('click', () => makeMove(row, col));
            } else if (!gameBoard[row][col]) {
                cell.classList.add('board-cell-disabled');
            }
            
            boardWrapper.appendChild(cell);
        }
    }
    
    gameBoard_UI.appendChild(boardWrapper);
}

// Handle player move
function makeMove(row, col) {
    if (gameOver || currentTurn !== playerSymbol || gameBoard[row][col]) return;
    
    socket.emit('makeMove', { roomId: currentRoom, row, col });
}

// Show game result
function showGameResult(winner) {
    gameOver = true;
    restartGameBtn.disabled = false;
    
    if (winner === 'draw') {
        resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-3xl';
        resultIcon.innerHTML = '<i class="fas fa-handshake text-gray-500"></i>';
        resultTitle.textContent = 'Hòa!';
        resultMessage.textContent = 'Trận đấu kết thúc với kết quả hòa.';
    } else {
        const isWinner = winner === playerSymbol;
        
        if (isWinner) {
            resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-3xl';
            resultIcon.innerHTML = '<i class="fas fa-trophy text-yellow-500"></i>';
            resultTitle.textContent = 'Chiến thắng!';
            resultMessage.textContent = 'Chúc mừng, bạn đã thắng trận đấu này!';
        } else {
            resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-3xl';
            resultIcon.innerHTML = '<i class="fas fa-times text-red-500"></i>';
            resultTitle.textContent = 'Thua cuộc!';
            resultMessage.textContent = 'Rất tiếc, bạn đã thua trận đấu này.';
        }
    }
    
    // Show the result overlay
    gameResult.classList.remove('hidden');
    
    // Add animation
    gameResult.querySelector('div').classList.add('scale-0');
    setTimeout(() => {
        gameResult.querySelector('div').classList.remove('scale-0');
        gameResult.querySelector('div').classList.add('scale-100');
    }, 100);
}

// Event Listeners
createRoomBtn.addEventListener('click', () => showScreen('createRoom'));
joinRoomBtn.addEventListener('click', () => showScreen('joinRoom'));

generateRoomIdBtn.addEventListener('click', () => {
    newRoomIdInput.value = generateRoomId();
});

createRoomConfirmBtn.addEventListener('click', () => {
    const roomId = newRoomIdInput.value.trim();
    if (!roomId) {
        showToast('Vui lòng nhập mã phòng!', 'error');
        return;
    }
    socket.emit('createRoom', roomId);
});

createRoomBackBtn.addEventListener('click', () => showScreen('welcome'));

joinRoomConfirmBtn.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId) {
        showToast('Vui lòng nhập mã phòng!', 'error');
        return;
    }
    socket.emit('joinRoom', roomId);
});

joinRoomBackBtn.addEventListener('click', () => showScreen('welcome'));

copyRoomIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(roomIdDisplay.textContent)
        .then(() => showToast('Đã sao chép mã phòng!', 'success'))
        .catch(() => showToast('Không thể sao chép mã phòng!', 'error'));
});

leaveRoomBtn.addEventListener('click', () => {
    currentRoom = null;
    showScreen('welcome');
    socket.emit('leaveRoom');
});

exitGameBtn.addEventListener('click', () => {
    currentRoom = null;
    showScreen('welcome');
    socket.emit('leaveRoom');
});

restartGameBtn.addEventListener('click', () => {
    socket.emit('restartGame', currentRoom);
});

playAgainBtn.addEventListener('click', () => {
    socket.emit('restartGame', currentRoom);
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('roomCreated', (data) => {
    currentRoom = data.roomId;
    playerSymbol = data.symbol;
    roomIdDisplay.textContent = currentRoom;
    showScreen('waiting');
});

socket.on('roomJoined', (data) => {
    currentRoom = data.roomId;
    playerSymbol = data.symbol;
    gameBoard = data.board;
    gameRoomId.textContent = currentRoom;
    updatePlayerStatus();
});

socket.on('gameStart', (data) => {
    gameBoard = data.board;
    currentTurn = data.currentTurn;
    gameOver = false;
    gameResult.classList.add('hidden');
    restartGameBtn.disabled = true;

    showScreen('game');
    updateTurnDisplay();
    renderBoard();
    
    showToast('Người chơi thứ hai đã tham gia! Trận đấu bắt đầu!', 'success');
});

socket.on('boardUpdate', (data) => {
    gameBoard = data.board;
    currentTurn = data.currentTurn;
    
    // Render board
    renderBoard();
    
    // Highlight last move
    const { row, col, symbol } = data.lastMove;
    setTimeout(() => {
        const cell = gameBoard_UI.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('last-move', 'cell-appear');
        }
    }, 50);
    
    // Update turn display
    updateTurnDisplay();
});

socket.on('gameOver', (data) => {
    gameBoard = data.board;
    gameOver = true;
    renderBoard();
    showGameResult(data.winner);
});

socket.on('gameRestarted', (data) => {
    gameBoard = data.board;
    currentTurn = data.currentTurn;
    gameOver = false;
    gameResult.classList.add('hidden');
    restartGameBtn.disabled = true;
    
    renderBoard();
    updateTurnDisplay();
    
    showToast('Bắt đầu trận đấu mới!', 'info');
});

socket.on('playerDisconnected', () => {
    showToast('Đối thủ đã ngắt kết nối!', 'error');
    restartGameBtn.disabled = true;
});

socket.on('roomError', (message) => {
    showToast(message, 'error');
});

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome');
    newRoomIdInput.value = generateRoomId();
}); 