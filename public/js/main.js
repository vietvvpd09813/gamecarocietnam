// Kiểm tra xem io đã được định nghĩa chưa
if (typeof io === 'undefined') {
    console.error('Socket.io client không được tải. Đang tải lại trang...');
    // Nếu không tìm thấy io, thêm thẻ script vào trang
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    script.integrity = 'sha384-mZLF4UVrpi/QTWPA7BjNPEnkIfRFn4ZEO3Qt/HFklTJBj/gBOV8G3HcKn4NfQblz';
    script.crossOrigin = 'anonymous';
    script.onload = () => window.location.reload();
    document.head.appendChild(script);
    // Hiển thị thông báo lỗi
    const errorMsg = document.createElement('div');
    errorMsg.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; text-align: center;">
            <h2 style="color: #e53e3e; margin-bottom: 20px; font-size: 24px;">Lỗi kết nối</h2>
            <p style="margin-bottom: 20px; max-width: 600px;">Không thể kết nối đến máy chủ. Đang tải lại trang...</p>
            <div style="width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(errorMsg);
    throw new Error('Socket.io client không được tải.');
}

// Connect to the server using Socket.io with explicit URL
let socket;
try {
    // Kiểm tra nếu đang chạy trên Vercel
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const socketURL = isProduction ? window.location.origin : 'http://localhost:3000';
    
    console.log('Connecting to Socket.io server at:', socketURL);
    
    socket = io(socketURL, {
        transports: ['polling'], // Chỉ sử dụng polling trên Vercel, không dùng websocket
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
    });
    
    console.log('Socket instance created:', socket);
} catch (error) {
    console.error('Error initializing socket:', error);
    alert('Không thể kết nối đến máy chủ. Vui lòng tải lại trang.');
}

// Log connection status
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    showToast('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', 'error');
});

// Xử lý heartbeat
socket.on('ping', () => {
    console.log('Received ping, sending pong');
    socket.emit('pong');
});

// Game state variables
let gameBoard = Array(15).fill().map(() => Array(15).fill(null));
let currentTurn = 'X'; // Người chơi luôn là X
let gameOver = false;
let winner = null;
let difficulty = 'medium';
let scores = {
    player: 0,
    computer: 0
};

// DOM elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    game: document.getElementById('game-screen')
};

// UI elements
const playComputerBtn = document.getElementById('play-computer-btn');
const difficultySelect = document.getElementById('difficulty-select');
const gameDifficulty = document.getElementById('game-difficulty');
const turnIcon = document.getElementById('turn-icon');
const turnMessage = document.getElementById('turn-message');
const gameBoard_UI = document.getElementById('game-board');
const restartGameBtn = document.getElementById('restart-game');
const backToMenuBtn = document.getElementById('back-to-menu');
const gameResult = document.getElementById('game-result');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
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
        turnMessage.textContent = 'Lượt của bạn';
    } else {
        turnIcon.classList.add('bg-red-100');
        turnIcon.innerHTML = '<span class="text-red-700">O</span>';
        turnMessage.textContent = 'Lượt của máy';
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
            if (!gameBoard[row][col] && !gameOver && currentTurn === 'X') {
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
    if (gameOver || currentTurn !== 'X' || gameBoard[row][col]) return;
    
    gameBoard[row][col] = 'X';
    
    // Render the cell with animation
    renderBoard();
    
    // Highlight last move
    setTimeout(() => {
        const cell = gameBoard_UI.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('last-move', 'cell-appear');
        }
    }, 50);
    
    // Check for win
    if (checkWin(gameBoard, row, col, 'X')) {
        gameOver = true;
        winner = 'X';
        scores.player++;
        updateScoreDisplay();
        showGameResult('X');
        return;
    }
    
    // Check for draw
    if (checkDraw(gameBoard)) {
        gameOver = true;
        showGameResult('draw');
        return;
    }
    
    // Switch turns
    currentTurn = 'O';
    updateTurnDisplay();
    
    // Computer's turn
    setTimeout(() => {
        computerMove();
    }, 700);
}

// Computer makes a move
function computerMove() {
    if (gameOver) return;
    
    let move;
    
    switch (difficulty) {
        case 'easy':
            move = findRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.6 ? findBestMove(3) : findRandomMove();
            break;
        case 'hard':
            move = findBestMove(4);
            break;
        default:
            move = findBestMove(3);
    }
    
    if (!move) {
        move = findRandomMove();
    }
    
    // Make the move
    gameBoard[move.row][move.col] = 'O';
    
    // Render the cell with animation
    renderBoard();
    
    // Highlight last move
    setTimeout(() => {
        const cell = gameBoard_UI.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (cell) {
            cell.classList.add('last-move', 'cell-appear');
        }
    }, 50);
    
    // Check for win
    if (checkWin(gameBoard, move.row, move.col, 'O')) {
        gameOver = true;
        winner = 'O';
        scores.computer++;
        updateScoreDisplay();
        showGameResult('O');
        return;
    }
    
    // Check for draw
    if (checkDraw(gameBoard)) {
        gameOver = true;
        showGameResult('draw');
        return;
    }
    
    // Switch turns
    currentTurn = 'X';
    updateTurnDisplay();
    
    // Render lại bàn cờ để gán sự kiện click cho các ô trống
    renderBoard();
}

// Find a random valid move
function findRandomMove() {
    const emptySpots = [];
    
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            if (gameBoard[row][col] === null) {
                emptySpots.push({ row, col });
            }
        }
    }
    
    if (emptySpots.length === 0) {
        return null;
    }
    
    return emptySpots[Math.floor(Math.random() * emptySpots.length)];
}

// AI for better moves - Simple implementation for demonstration
function findBestMove(depth = 3) {
    const possibleMoves = getPossibleMoves();
    
    if (possibleMoves.length === 0) return null;
    
    // Start with random move (fallback)
    let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    let bestScore = -Infinity;
    
    // Analyze each possible move
    for (const move of possibleMoves) {
        gameBoard[move.row][move.col] = 'O';
        const score = evaluateBoard(move.row, move.col, 'O', depth);
        gameBoard[move.row][move.col] = null;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// Get list of possible moves that focuses on areas near existing pieces
function getPossibleMoves() {
    const possibleMoves = [];
    const priorities = [];
    
    // First move in the center or near center if player didn't start there
    if (gameBoard.flat().filter(cell => cell !== null).length <= 1) {
        const centerMoves = [
            {row: 7, col: 7},
            {row: 7, col: 8},
            {row: 8, col: 7},
            {row: 8, col: 8}
        ];
        
        for (const move of centerMoves) {
            if (!gameBoard[move.row][move.col]) {
                return [move];
            }
        }
    }
    
    // Look for spaces near existing pieces
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            if (gameBoard[row][col] !== null) continue;
            
            // Check if this cell is adjacent to any existing piece
            let isAdjacent = false;
            let priority = 0;
            
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    
                    const r = row + dr;
                    const c = col + dc;
                    
                    if (r >= 0 && r < 15 && c >= 0 && c < 15 && gameBoard[r][c] !== null) {
                        isAdjacent = true;
                        priority += (Math.abs(dr) === 1 && Math.abs(dc) === 1) ? 2 : 1;
                        
                        // Add extra priority for spaces that could complete a sequence
                        if (gameBoard[r][c] === 'O') {
                            priority += 3;
                        }
                        
                        // Block player's potential win
                        if (gameBoard[r][c] === 'X') {
                            const temp = gameBoard[row][col];
                            gameBoard[row][col] = 'X';
                            if (checkWin(gameBoard, row, col, 'X')) {
                                priority += 20; // High priority to block win
                            }
                            gameBoard[row][col] = temp;
                        }
                    }
                }
            }
            
            if (isAdjacent) {
                possibleMoves.push({row, col});
                priorities.push(priority);
            }
        }
    }
    
    // If no adjacent cells found, consider all empty cells
    if (possibleMoves.length === 0) {
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (gameBoard[row][col] === null) {
                    possibleMoves.push({row, col});
                    priorities.push(1);
                }
            }
        }
    }
    
    // Sort moves by priority (higher first)
    const sortedMoves = possibleMoves.map((move, i) => ({...move, priority: priorities[i]}))
        .sort((a, b) => b.priority - a.priority);
    
    // Return top moves (limiting to improve performance)
    return sortedMoves.slice(0, 10).map(({row, col}) => ({row, col}));
}

// Evaluate the board - higher score is better for the AI
function evaluateBoard(row, col, symbol, depth = 1) {
    // Check if the move creates a win
    if (checkWin(gameBoard, row, col, symbol)) {
        return symbol === 'O' ? 1000 : -1000;
    }
    
    if (depth <= 0) {
        return evaluatePosition(row, col, symbol);
    }
    
    let score = evaluatePosition(row, col, symbol);
    
    // Look ahead for potential next moves
    const nextSymbol = symbol === 'O' ? 'X' : 'O';
    const possibleNextMoves = getNearbyEmptyCells(row, col, 2);
    
    if (possibleNextMoves.length > 0) {
        let bestNextScore = symbol === 'O' ? Infinity : -Infinity;
        
        for (const nextMove of possibleNextMoves.slice(0, 3)) { // Limit to 3 moves for performance
            gameBoard[nextMove.row][nextMove.col] = nextSymbol;
            const nextScore = evaluateBoard(nextMove.row, nextMove.col, nextSymbol, depth - 1);
            gameBoard[nextMove.row][nextMove.col] = null;
            
            if (symbol === 'O') {
                bestNextScore = Math.min(bestNextScore, nextScore);
            } else {
                bestNextScore = Math.max(bestNextScore, nextScore);
            }
        }
        
        // Combine current position score with look-ahead score
        score = symbol === 'O' ? score - (bestNextScore * 0.3) : score + (bestNextScore * 0.3);
    }
    
    return score;
}

// Get nearby empty cells within distance
function getNearbyEmptyCells(row, col, distance = 1) {
    const emptyCells = [];
    
    for (let r = Math.max(0, row - distance); r <= Math.min(14, row + distance); r++) {
        for (let c = Math.max(0, col - distance); c <= Math.min(14, col + distance); c++) {
            if (gameBoard[r][c] === null) {
                emptyCells.push({row: r, col: c});
            }
        }
    }
    
    return emptyCells;
}

// Evaluate a position's potential
function evaluatePosition(row, col, symbol) {
    let score = 0;
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal down-right
        [1, -1]   // Diagonal down-left
    ];
    
    for (const [dr, dc] of directions) {
        score += evaluateDirection(row, col, dr, dc, symbol);
    }
    
    // Bonus for center positions
    const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
    score += Math.max(0, 10 - centerDistance);
    
    return score;
}

// Evaluate a single direction
function evaluateDirection(row, col, dr, dc, symbol) {
    let score = 0;
    let ownCount = 0;
    let emptyCount = 0;
    let blocked = 0;
    
    // Check in positive direction
    for (let i = 1; i < 5; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        
        if (r < 0 || r >= 15 || c < 0 || c >= 15) {
            blocked++;
            break;
        }
        
        if (gameBoard[r][c] === symbol) {
            ownCount++;
        } else if (gameBoard[r][c] === null) {
            emptyCount++;
        } else {
            blocked++;
            break;
        }
    }
    
    // Check in negative direction
    for (let i = 1; i < 5; i++) {
        const r = row - i * dr;
        const c = col - i * dc;
        
        if (r < 0 || r >= 15 || c < 0 || c >= 15) {
            blocked++;
            break;
        }
        
        if (gameBoard[r][c] === symbol) {
            ownCount++;
        } else if (gameBoard[r][c] === null) {
            emptyCount++;
        } else {
            blocked++;
            break;
        }
    }
    
    // Scoring based on number of same symbols and open ends
    if (ownCount >= 4) return 100; // Four in a row
    if (ownCount === 3 && blocked < 2) return 50; // Three in a row with at least one open end
    if (ownCount === 2 && blocked < 2) return 20; // Two in a row with at least one open end
    if (ownCount === 1 && blocked < 2) return 5; // One with open ends
    
    // Penalize blocked positions
    if (blocked === 2) return 0;
    
    return ownCount * 2 + emptyCount;
}

// Update score display
function updateScoreDisplay() {
    playerScoreDisplay.textContent = scores.player;
    computerScoreDisplay.textContent = scores.computer;
}

// Show game result
function showGameResult(winner) {
    gameOver = true;
    
    if (winner === 'draw') {
        resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-3xl';
        resultIcon.innerHTML = '<i class="fas fa-handshake text-gray-500"></i>';
        resultTitle.textContent = 'Hòa!';
        resultMessage.textContent = 'Trận đấu kết thúc với kết quả hòa.';
    } else {
        const isPlayerWin = winner === 'X';
        
        if (isPlayerWin) {
            resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-3xl';
            resultIcon.innerHTML = '<i class="fas fa-trophy text-yellow-500"></i>';
            resultTitle.textContent = 'Chiến thắng!';
            resultMessage.textContent = 'Chúc mừng, bạn đã thắng!';
        } else {
            resultIcon.className = 'w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-3xl';
            resultIcon.innerHTML = '<i class="fas fa-robot text-red-500"></i>';
            resultTitle.textContent = 'Thua cuộc!';
            resultMessage.textContent = 'Máy tính đã thắng lần này.';
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

// Check for win condition
function checkWin(board, row, col, symbol) {
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal down-right
        [1, -1]   // Diagonal down-left
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        
        // Check in positive direction
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            
            if (
                newRow < 0 || newRow >= 15 || 
                newCol < 0 || newCol >= 15 ||
                board[newRow][newCol] !== symbol
            ) break;
            
            count++;
        }
        
        // Check in negative direction
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            
            if (
                newRow < 0 || newRow >= 15 || 
                newCol < 0 || newCol >= 15 ||
                board[newRow][newCol] !== symbol
            ) break;
            
            count++;
        }
        
        if (count >= 5) return true;
    }
    
    return false;
}

// Check for draw
function checkDraw(board) {
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            if (board[row][col] === null) {
                return false;
            }
        }
    }
    return true;
}

// Start a new game
function startGame() {
    // Set difficulty
    difficulty = difficultySelect.value;
    gameDifficulty.textContent = 
        difficulty === 'easy' ? 'Dễ' : 
        difficulty === 'hard' ? 'Khó' : 'Trung bình';
    
    // Reset game board
    gameBoard = Array(15).fill().map(() => Array(15).fill(null));
    currentTurn = 'X';
    gameOver = false;
    winner = null;
    
    // Show game screen
    showScreen('game');
    
    // Update turn display
    updateTurnDisplay();
    
    // Render empty board
    renderBoard();
    
    // Hide game result overlay
    gameResult.classList.add('hidden');
    
    // Show toast
    showToast(`Bắt đầu trò chơi mới với độ khó: ${gameDifficulty.textContent}`, 'success');
}

// Restart the current game
function restartGame() {
    // Reset game board
    gameBoard = Array(15).fill().map(() => Array(15).fill(null));
    currentTurn = 'X';
    gameOver = false;
    winner = null;
    
    // Update turn display
    updateTurnDisplay();
    
    // Render empty board
    renderBoard();
    
    // Hide game result overlay
    gameResult.classList.add('hidden');
    
    // Show toast
    showToast('Bắt đầu lại trận đấu', 'info');
}

// Event Listeners
playComputerBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', restartGame);
backToMenuBtn.addEventListener('click', () => showScreen('welcome'));
playAgainBtn.addEventListener('click', restartGame);

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome');
}); 