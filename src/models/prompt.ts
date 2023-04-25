import mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Prompt', PromptSchema);
