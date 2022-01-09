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
const auth = require('./src/routes/auth');
// const chats = require('./src/routes/chats');

// Error Handlers:
const AppError = require('./src/utils/appErrors');
const errorHandler = require('./src/controllers/errorController');
// Middlewares:
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(express.json());

app.get('/api/v1/chatlist', (req, res) => {
  res.json(chatlistObj);
});

app.get('/api/v1/chats', (req, res) => {
  res.json(chatsObj);
});

// Auth:
app.use('/api/v1/user/auth', auth);

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
