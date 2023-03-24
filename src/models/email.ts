import mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
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
    emailId: {
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

module.exports = mongoose.model('Email', EmailSchema);
