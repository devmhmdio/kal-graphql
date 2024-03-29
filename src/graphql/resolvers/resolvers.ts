import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../../models/context';
import { IResolvers } from 'graphql-tools';
import * as jwt from 'jsonwebtoken';
import { AppConstants } from '../../constants/app.constants';
import { UsersController } from '../../controllers/users.controller';
import { CreateConnController } from '../../controllers/createConn.controller';
import { StripeController } from '../../controllers/stripe.controller';

const usersController = new UsersController();
const createConnController = new CreateConnController();
const stripeController = new StripeController();

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
    getMsgs: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return createConnController.getMsgDataFromDb(args);
    },
    getPrompt: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return createConnController.getPrompt(args);
    },
    getMessagePrompt: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return createConnController.getMessagePrompt(args);
    },
    getUserCompanyAdmin: (_, inputObject, ctx: Context) => {
      return usersController.getUserAsCompanyAdmin(inputObject);
    },
    getUserBalance: (_, inputObject, ctx: Context) => {
      return usersController.getUserBalance(inputObject);
    },
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
    sendResetPasswordEmail: (_, inputObject, ctx: Context) => {
      return usersController.sendResetPasswordEmail(inputObject);
    },
    resetPassword: (_, inputObject) => {
      return usersController.resetPasswordUser(inputObject);
    },
    getAllUsers: (_, inputObject, ctx: Context) => {
      return usersController.getAllUsers(inputObject);
    },
    viewAllEmailsSent: (_, inputObject, ctx: Context) => {
      return createConnController.viewAllEmailsSent(inputObject);
    },
    viewAllMessagesSent: (_, inputObject, ctx: Context) => {
      return createConnController.viewAllMessagesSent(inputObject);
    },
    capturePayment: (_, inputObject, ctx: Context) => {
      return stripeController.capturePayment(inputObject);
    },
  },
};

export default resolvers;
