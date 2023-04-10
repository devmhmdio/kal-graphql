import { Context } from '../models/context';
import { buildErrorResponse } from '../utils/buildErrorResponse';
import { successResponse } from '../utils/successResponse';
const Users = require('../models/users');
const Prompt = require('../models/prompt');
const MessagePrompt = require('../models/mobilePrompt');
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../utils/email';
import { generateResetToken } from '../utils/resetToken';

export class UsersController {
  async addUser(inputObject: any, ctx: Context) {
    try {
      const email = inputObject.input.email;
      const question = `Write a professional concise e-mail which is targeted to a potential recipient who's quite an influential and important person in that company. Tell how the sender can help the client, and ask for a meeting schedule if interested. The description of the sender's business/services is given by following keyword/description: <Business Description> The recipient name: <name> recipient's business is related to <Client Description> Identify and sell on three best selling points based on possible issues faced by clients in terms of a <Business Description>. The sender's name is <Sender's Name> and position is <Sender Position> in the company and the sender is sending email on the behalf of the company and not as an individual. Include a Subject line. Do not include or write a salutation. Write it in proper paragraph form. Leave a line after each point and the 3rd point too. Also, leave a line after a paragraph ends and before writing the sender's name.`;
      const smsQuestion = `Write a short SMS message requesting a quick phone call with [Name], to follow up on my recent email. The call is fairly urgent and you would like it to take place tomorrow. Please suggest morning or afternoon for the call.`;
      await Prompt.create({ question, email });
      await MessagePrompt.create({ question: smsQuestion, email });
      const result = await Users.create(inputObject.input);
      return successResponse(result, 'created');
    } catch (error) {
      return buildErrorResponse(error);
    }
  }
  async getUsers(args) {
    try {
      const result = await Users.findOne({ email: args.input.email, password: args.input.password });
      if (!result) {
        throw new Error('Invalid email or password')
      }
      const token = jwt.sign({ userId: result._id, email: result.email, name: result.name, phone: result.phone, app_password: result.app_password, company: result.company, position: result.position }, 'asdfghjkL007', { expiresIn: '1h' });
      return {result, token};
    } catch (error) {
      return buildErrorResponse(error);
    }
  }
  async updateUser(inputObject: any, ctx: Context) {
    try {
      for (const key in inputObject.input) {
        if (inputObject.input[key] === '') {
          delete inputObject.input[key];
        }
      }
      const email = inputObject.input.email;
      delete inputObject.input.email;
      const result = await Users.findOneAndUpdate({ email }, inputObject.input);
      if (result) {
        return successResponse(result, 'updated');
      }
      return successResponse(result, 'notUpdated');
    } catch (error) {
      return buildErrorResponse(error);
    }
  }

  async sendResetPasswordEmail(inputObject: any) {
    try {
      const user = await Users.findOne({ email: inputObject.email });
      if (!user) {
        return buildErrorResponse('User not found');
      }
      const resetToken = generateResetToken();
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();
      // const resetUrl = `http://localhost:3000/reset-password?${resetToken}`;
      const resetUrl = `http://app.traifecta.com/reset-password?${resetToken}`;
      sendResetPasswordEmail(inputObject.email, resetUrl);
      return "Mail sent";
    } catch (error) {
      return buildErrorResponse(error);
    }
  }

  async resetPasswordUser(inputObject: any) {
    try {
      const resetToken = inputObject.input.token;
      const password = inputObject.input.password;

      const user = await Users.findOne({ resetToken });
      if (!user) {
        return "Invalid reset token";
      }
      // Update user password
      user.password = password;
      user.resetToken = null;
      await user.save();
      return "Password reset successful";
    } catch (e) {
      return buildErrorResponse(e)
    }
  }

  async deleteUser(inputObject: any, ctx: Context) {
    try {
      const result = await Users.findOneAndDelete({ _id: inputObject.id });
      return successResponse(result, 'deleted');
    } catch (error) {
      return buildErrorResponse(error);
    }
  }

  async findByUserId(inputObject: any, ctx: Context) {
    try {
      const result = await Users.findById(inputObject.id);
      return successResponse(result, 'deleted');
    } catch (error) {
      return buildErrorResponse(error);
    }
  }

  async returnTokenData(inputObject: any) {
    try {
      const token = inputObject.token;
      const decodedToken = jwt.verify(token, "asdfghjkL007")
      return decodedToken
    } catch (e) {
      console.error(e)
    }
  }

  async getAllUsers({ id }: any) {
    try {
      const getCurrentUser = await Users.findOne({ _id: id });
      if (!getCurrentUser) 'Cannot find any such user'
      if (getCurrentUser.role === 'super admin') {
        const users = await Users.find({});
        return users;
      }
      return 'Unauthorised access';
    } catch (e) {
      throw new Error(e);
    }
  }
}
