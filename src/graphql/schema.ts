import typesArray from './schemas/typeDefs';
// import * as rootDefs from './schemas/schema.graphql';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers/resolvers';

const schema = makeExecutableSchema({
  typeDefs: typesArray,
  resolvers,
});

export default schema;
