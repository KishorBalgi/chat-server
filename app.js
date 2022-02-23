const express = require('express');
const app = express();
const fs = require('fs');
// Chatlist:
const chatlist = fs.readFileSync('./src/test-data/chat-list.json', 'utf-8');
const chatlistObj = JSON.parse(chatlist);
// Chats:
const chats = fs.readFileSync('./src/test-data/chats.json', 'utf-8');
const chatsObj = JSON.parse(chats);
// Routers:
const auth = require('./src/routes/authRoute');
const user = require('./src/routes/userRoute');

// const chats = require('./src/routes/chats');

// Error Handlers:
const AppError = require('./src/utils/appErrors');
const errorHandler = require('./src/controllers/errorController');
// Security:
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
// Middlewares:
// CORS:
// var corsOrigin = 'http://localhost:3000';
// if (process.env.NODE_ENV === 'production') {
//   corsOrigin = 'https://chat-box-app-client.herokuapp.com/';
// }
app.use(
  cors({
    origin: 'https://chat-box-app-client.herokuapp.com',
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.options('*', cors());
// Trust proxies:
app.enable('trust proxy');
// HTTP Headers:
app.use(helmet());
// Data sanitization against NoSQL query injection:
app.use(mongoSanitize());
// Data sanitization against XSS:
app.use(xss());
// Preventing HTTP Parameter Pollution:
app.use(hpp());
// Rate Limiter:
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, try again after an hour',
});
app.use('/api', limiter);
// Compress responses:
app.use(compression());
// JSON:
app.use(express.json());
// Cookie parser:
app.use(cookieParser());
// CSP:
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' *; font-src 'self' *; img-src 'self' *; script-src 'self' *; style-src 'self' *; frame-src 'self' *"
  );
  next();
});

app.get('/api/v1/chatlist', (req, res) => {
  res.json(chatlistObj);
});

app.get('/api/v1/chats', (req, res) => {
  res.json(chatsObj);
});

// User Auth:
app.use('/api/v1/user/auth', auth);
// User:
app.use('/api/v1/user', user);

// Chats:
// app.use('/api/v1/user/chats', chats);

// Unhandled Routes:
app.all('*', (req, res, next) => {
  next(
    new AppError(`Could not find the url:${req.originalUrl} on this server.`)
  );
});

app.use(errorHandler.globalErrorHandler);

module.exports = app;
