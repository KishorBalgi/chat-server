const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});
const dotenv = require('dotenv');
const mogoose = require('mongoose');
const authController = require('./src/controllers/authController');

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
  if (socket.handshake.auth.token) {
    user = await authController.verifyToken(socket.handshake.auth.token, next);
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
  } else {
    next(new Error('Please Login'));
  }
});
io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.on('msg', (msg) => {
    console.log('Message: ', msg);
  });
});

process.on('unhandledRejection', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error 💥: Shutting down app...');
  ser.close(() => {
    process.exit(1);
  });
});
