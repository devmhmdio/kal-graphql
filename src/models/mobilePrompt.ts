import mongoose = require('mongoose');

const MessagePromptSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MessagePrompt', MessagePromptSchema);
