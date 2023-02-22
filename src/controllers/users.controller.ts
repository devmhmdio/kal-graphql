import { Context } from '../models/context';
import { buildErrorResponse } from '../utils/buildErrorResponse';
import { successResponse } from '../utils/successResponse';
const Users = require('../models/users');
import jwt from 'jsonwebtoken';

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

      const token = jwt.sign({ userId: result._id, email: result.email, name: result.name, app_password: result.app_password, company: result.company }, 'asdfghjkL007', { expiresIn: '1h' });

      return {result, token};
    } catch (error) {
      return buildErrorResponse(error);
    }
  }
  async updateUser(inputObject: any, ctx: Context) {
    try {
      const result = await Users.findOneAndUpdate({ _id: inputObject.id }, inputObject.input);
      if (result) {
        return successResponse(result, 'updated');
      }
      return successResponse(result, 'notUpdated');
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
