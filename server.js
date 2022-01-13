const app = require('./app');
const dotenv = require('dotenv');
const mogoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error💥: Shutting down app...');
  process.exit(1);
});
// Config.env:
console.log(y);
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
const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`Listening to requests on port ${PORT}`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name + ': ' + err.message);
  console.log('Error 💥: Shutting down app...');
  server.close(() => {
    process.exit(1);
  });
});
