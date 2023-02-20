import { Context } from '../models/context';
import { buildErrorResponse } from '../utils/buildErrorResponse';
import { successResponse } from '../utils/successResponse';
const Users = require('../models/users');

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
    console.log('this is args', args)
    try {
      const result = await Users.findOne({ email: args.input.email, password: args.input.password }, 'email password').exec();
      console.log(result);
      return successResponse(result, 'fetch');
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
}
