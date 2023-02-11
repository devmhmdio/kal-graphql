import mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prompt', PromptSchema);
