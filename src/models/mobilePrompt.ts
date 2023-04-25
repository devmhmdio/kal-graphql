import mongoose = require('mongoose');

const MessagePromptSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    email: {
      type: String,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MessagePrompt', MessagePromptSchema);
