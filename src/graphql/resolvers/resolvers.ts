import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../../models/context';
import { IResolvers } from 'graphql-tools';
import * as jwt from 'jsonwebtoken';
import { AppConstants } from '../../constants/app.constants';
import { UsersController } from '../../controllers/users.controller';
import { CreateConnController } from '../../controllers/createConn.controller';

const usersController = new UsersController();
const createConnController = new CreateConnController();

const resolvers: IResolvers = {
  Query: {
    token: (_, args: any) => {
      return jwt.sign({ data: args[AppConstants.EMAIL] }, <string>process.env.auth_encryption_salt);
    },
    getUsers: async (_: void, args: any, ctx: Context) => {
      return await usersController.getUsers(args);
    },
    findByUserId: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return usersController.findByUserId(args, ctx);
    },
    getEmails: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return createConnController.getEmailDataFromDb(args);
    },
    getPrompt: () => {
      return createConnController.getPrompt();
    },
    getMessagePrompt: () => {
      return createConnController.getMessagePrompt();
    }
  },
  Mutation: {
    addUser: (_, inputObject, ctx: Context) => {
      return usersController.addUser(inputObject, ctx);
    },
    updateUser: (_, inputObject, ctx: Context) => {
      return usersController.updateUser(inputObject, ctx);
    },
    deleteUser: (_, inputObject, ctx: Context) => {
      return usersController.deleteUser(inputObject, ctx);
    },
    createConnection: (_, inputObject, ctx: Context) => {
      return createConnController.generate(inputObject, ctx);
    },
    createConnectionForMessage: (_, inputObject, ctx: Context) => {
      return createConnController.generateForMessage(inputObject, ctx);
    },
    addPrompt: (_, inputObject, ctx: Context) => {
      return createConnController.addPrompt(inputObject, ctx);
    },
    addMessagePrompt: (_, inputObject, ctx: Context) => {
      return createConnController.addMessagePrompt(inputObject, ctx);
    },
    updatePrompt: (_, inputObject, ctx: Context) => {
      return createConnController.updatePrompt(inputObject, ctx);
    },
    updateMessagePrompt: (_, inputObject, ctx: Context) => {
      return createConnController.updateMessagePrompt(inputObject, ctx);
    },
    sendEmail: (_, inputObject) => {
      return createConnController.sendEmail(inputObject);
    },
    sendMessage: (_, inputObject) => {
      return createConnController.sendMessage(inputObject);
    },
    saveChanges: (_, inputObject, ctx: Context) => {
      return createConnController.saveChanges(inputObject);
    },
    deleteAllResponsesFromDB: (_, inputObject, ctx: Context) => {
      return createConnController.deleteAllResponsesFromDB(inputObject);
    },
    returnToken: (_, inputObject, ctx: Context) => {
      return usersController.returnTokenData(inputObject);
    },
    linkedInMsg: () => {
      return createConnController.linkedInMsg();
    },
    sendResetPasswordEmail: (_, inputObject, ctx: Context) => {
      return usersController.sendResetPasswordEmail(inputObject);
    },
    resetPassword: (_, inputObject) => {
      return usersController.resetPasswordUser(inputObject);
    }
  },
};

export default resolvers;
