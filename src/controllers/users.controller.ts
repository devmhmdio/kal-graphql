import { Context } from '../models/context';
import { buildErrorResponse } from '../utils/buildErrorResponse';
import { successResponse } from '../utils/successResponse';
const Users = require('../models/users');
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../utils/email';
import { generateResetToken } from '../utils/resetToken';

export class UsersController {
  async addUser(inputObject: any, ctx: Context) {
    try {
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
      const result = await Users.findOneAndUpdate({ email: inputObject.email }, inputObject.input);
      if (result) {
        return successResponse(result, 'updated');
      }
      return successResponse(result, 'notUpdated');
    } catch (error) {
      return buildErrorResponse(error);
    }
  }

  async resetPassword(inputObject: any) {
    try {
      const user = await Users.findOne({ email: inputObject.email });
      if (!user) {
        return buildErrorResponse('User not found');
      }
      const resetToken = generateResetToken();
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();
      const resetUrl = `https://app.traifecta.com/reset-password/${resetToken}`;
      return sendResetPasswordEmail(inputObject.email, resetUrl);
    } catch (error) {
      return buildErrorResponse(error);
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
      console.log(result);
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
}
