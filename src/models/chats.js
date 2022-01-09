const mongoose = require('mongoose');

const chatsSchema = new mongoose.Schema({
  recipient_name: {
    type: String,
    required: [true, 'Recipirnt Username required'],
  },
  recipient_uid: { type: String, required: [true, 'Recipient UID required'] },
  receiver_uid: { type: String, required: [true, 'Receiver UID required'] },
  chatStart: { type: Date, required: [true, 'Chat Start Date required'] },
  msgNewest: { type: String },
  chats: { type: Array },
});

const Chats = mongoose.model('chats', chatsSchema);
module.exports = Chats;
