const app = require('./app');
const dotenv = require('dotenv');
const mogoose = require('mongoose');

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
app.listen(process.env.PORT || PORT, () => {
  console.log(`Listening to requests on port ${PORT}`);
});
