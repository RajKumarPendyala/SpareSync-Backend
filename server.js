const app = require('./app/app');
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*' }
});
const PORT = process.env.PORT || 5000;


// Store socket.io instance globally
app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId); // join user-specific room
    console.log('User connected');
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});












// userId is the ID of the client connecting to WebSocket server, i.e., logged-in user who 
// opens the socket connection, they should pass their own ID in the connection request.
//Example from frontend:
// const socket = io('http://localhost:3000', {
//   query: {
//     userId: currentUserId, // This is the sender's ID
//   }
// });
