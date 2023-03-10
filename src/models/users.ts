import mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    provider: {
      type: String,
    },
    contactType: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    app_password: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
contactType: String;
phone: String;
