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
    getUsers: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return usersController.getUsers();
    },
    findByUserId: (_: void, args: any, ctx: Context, _info: GraphQLResolveInfo) => {
      return usersController.findByUserId(args, ctx);
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
    addPrompt: (_, inputObject, ctx: Context) => {
      return createConnController.addPrompt(inputObject, ctx);
    },
  },
};

export default resolvers;
