import { Document, model, Model, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IUserDocument extends Document {
  email: string;
  name: string;
  photoUrl: string;
  provider: string;
  contactType: string;
  phone: string;
  password: string;
  app_password: string;
  company: string;
  position: string;
  resetToken: string | null;
  resetTokenExpiration: Date | null;
  returnToken: () => string;
}

const UserSchema: Schema<IUserDocument> = new Schema(
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
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      default: 'member',
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.returnToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour
  this.resetToken = resetToken;
  this.resetTokenExpiration = resetTokenExpiration;
  return resetToken;
};

module.exports = model<IUserDocument>('User', UserSchema);
contactType: String;
phone: String;
