import mongoose = require('mongoose');

const SentMessagesSchema = new mongoose.Schema(
  {
    toNumber: {
      type: String,
      required: true,
    },
    toName: {
      type: String,
      default: 'NA'
    },
    fromEmail: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SentMessages', SentMessagesSchema);
