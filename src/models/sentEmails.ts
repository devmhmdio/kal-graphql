import mongoose = require('mongoose');

const SentEmailsSchema = new mongoose.Schema(
  {
    toEmail: {
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
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SentEmails', SentEmailsSchema);
