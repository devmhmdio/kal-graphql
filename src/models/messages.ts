import mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    csvName: {
      type: String,
    },
    number: {
      type: String,
    },
    emailLoggedInUser: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', MessageSchema);
