const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Check if the environment is Vercel serverless
const isVercel = process.env.VERCEL || false;

// Create Socket.io server with appropriate CORS settings
const io = isVercel 
  ? new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/api/socketio'
    })
  : new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle API route for Vercel
if (isVercel) {
  app.post('/api/socketio', (req, res) => {
    res.json({ message: 'Socket.io API endpoint' });
  });
}

// Game state
const rooms = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new game room
  socket.on('createRoom', (roomId) => {
    if (rooms[roomId]) {
      socket.emit('roomError', 'Room already exists!');
    } else {
      rooms[roomId] = {
        id: roomId,
        players: [{ id: socket.id, symbol: 'X' }],
        board: Array(15).fill().map(() => Array(15).fill(null)),
        currentTurn: 'X',
        gameOver: false,
        winner: null
      };
      
      socket.join(roomId);
      socket.emit('roomCreated', { roomId, symbol: 'X' });
      console.log(`Room created: ${roomId}`);
    }
  });

  // Join an existing game room
  socket.on('joinRoom', (roomId) => {
    const room = rooms[roomId];
    
    if (!room) {
      socket.emit('roomError', 'Room does not exist!');
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('roomError', 'Room is full!');
      return;
    }

    room.players.push({ id: socket.id, symbol: 'O' });
    socket.join(roomId);
    
    socket.emit('roomJoined', { roomId, symbol: 'O', board: room.board });
    io.to(roomId).emit('gameStart', { board: room.board, currentTurn: room.currentTurn });
    console.log(`Player joined room: ${roomId}`);
  });

  // Handle player moves
  socket.on('makeMove', ({ roomId, row, col }) => {
    const room = rooms[roomId];
    
    if (!room) return;
    
    // Find player
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Check if it's the player's turn
    if (room.currentTurn !== player.symbol || room.gameOver) return;
    
    // Check if the cell is already filled
    if (room.board[row][col] !== null) return;
    
    // Make the move
    room.board[row][col] = player.symbol;
    
    // Check for win
    if (checkWin(room.board, row, col, player.symbol)) {
      room.gameOver = true;
      room.winner = player.symbol;
      io.to(roomId).emit('gameOver', { winner: player.symbol, board: room.board });
      return;
    }
    
    // Check for draw
    if (checkDraw(room.board)) {
      room.gameOver = true;
      io.to(roomId).emit('gameOver', { winner: 'draw', board: room.board });
      return;
    }
    
    // Switch turns
    room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    
    // Broadcast the updated board
    io.to(roomId).emit('boardUpdate', { 
      board: room.board, 
      lastMove: { row, col, symbol: player.symbol },
      currentTurn: room.currentTurn 
    });
  });

  // Handle restart game request
  socket.on('restartGame', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    
    room.board = Array(15).fill().map(() => Array(15).fill(null));
    room.currentTurn = 'X';
    room.gameOver = false;
    room.winner = null;
    
    io.to(roomId).emit('gameRestarted', { board: room.board, currentTurn: room.currentTurn });
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up any rooms the player was in
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room deleted: ${roomId}`);
        } else {
          io.to(roomId).emit('playerDisconnected');
        }
      }
    }
  });
});

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

// Start the server if not running in Vercel
if (!isVercel) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app; 