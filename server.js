const app = require('./app').app;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'https://chat-client-kb.vercel.app',
    methods: ['GET', 'POST'],
  },
});

const authController = require('./src/controllers/authController');
const socketController = require('./src/controllers/socketController');

process.on('uncaughtException', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error💥: Shutting down app...');
  process.exit(1);
});

// Socket:
// Auth:

io.use(async (socket, next) => {
  if (!socket.handshake.auth.token) return next(new Error('Please Login'));
  const user = await authController.verifyToken(socket.handshake.auth.token);
  if (!user) {
    return next(new Error('User no longer exists!', 404));
  }
  if (user.checkJWTExpired(user.iat)) {
    return next(
      new Error('User password was changed. Login again to access.', 401)
    );
  }
  socket.uid = user._id;
  next();
});
// On Connection:
const users = [];
io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`);
  socket.join('cluster');
  socket.join(socket.uid.toString());
  users.push(socket.uid.toString());
  // Send user online to cluster:
  socket.to('cluster').emit('online', socket.uid);
  // Check whether user is online:
  socket.on('isOnline', (id, cb) => {
    const i = users.indexOf(id);
    cb(i !== -1 ? true : false);
  });
  // Join a room:
  socket.on('join-room', async (props, cb) => {
    if (props.currRoom) socket.leave(props.currRoom);
    const room = await socketController.joinRoom(socket.uid, props.id);
    socket.join(room);
    cb(room);
  });
  // Send message:
  socket.on('send-message', async (data, room, toId) => {
    if (data.msg === '' && !data.file) return;
    socket.to(room).emit('receive-message', data, socket.uid);
    socket.to(toId).emit('new-message-from', socket.uid);
    socketController.storeChat(data, room, socket.uid);
  });
  // User Disconnect:
  socket.on('disconnect', () => {
    // Send user offline to cluster:
    socket.to('cluster').emit('offline', socket.uid);
    const i = users.indexOf(socket.uid.toString());
    if (i !== -1) users.splice(i, 1);
    console.log(`${socket.id} disconnected`);
  });
});
// Server:
const PORT = process.env.PORT;
const ser = server.listen(process.env.PORT || PORT, () => {
  console.log(`Listening to requests on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error 💥: Shutting down app...');
  ser.close(() => {
    process.exit(1);
  });
});
