const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: [
      'https://chat-box-app-client.herokuapp.com',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
  },
});
const dotenv = require('dotenv');
const mogoose = require('mongoose');
const authController = require('./src/controllers/authController');
const socketController = require('./src/controllers/socketController');

process.on('uncaughtException', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error💥: Shutting down app...');
  process.exit(1);
});
// Config.env:
dotenv.config({ path: './config.env' });
const PORT = process.env.PORT;
// DB:
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mogoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Database connection successful!'))
  .catch((err) => console.log(err));
// Server:
const ser = server.listen(process.env.PORT || PORT, () => {
  console.log(`Listening to requests on port ${PORT}`);
});

// Socket:
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
io.on('connection', (socket) => {
  console.log(`🟢 ${socket.id} connected`);
  socket.on('join-room', async (id, cb) => {
    const room = await socketController.joinRoom(socket.uid, id);
    socket.join(room);
    cb(room);
  });
  socket.on('send-message', async (msg, room) => {
    if (msg === '') return;
    socketController.storeChat(msg, room, socket.uid);
    socket.to(room).emit('receive-message', msg, socket.uid);
  });

  socket.on('disconnect', () => {
    socketController.updateDBOnDisconnect(socket.uid);
    console.log(`🔴 ${socket.id} disconnected`);
  });
});

process.on('unhandledRejection', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error 💥: Shutting down app...');
  ser.close(() => {
    process.exit(1);
  });
});
