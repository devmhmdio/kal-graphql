import { gql } from 'apollo-server';

export default gql`
  scalar JSON
  type User {
    email: String
    name: String
    phone: String
  }

  type Query {
    getUsers(contactType: String): getUsersData
    findByUserId(id: String!): findByUserIdData
    token(email: String!): String!
    getEmails: [emailsDataOutput]!
    getPrompt: JSON
  }

  type emailsDataOutput {
    subject: String!
    body: String!
    name: String
    emailId: String
  }

  type getUsersData {
    status: Status
    data: [User]
  }

  type findByUserIdData {
    status: Status
    data: User
  }

  type deleteUsersData {
    status: Status
  }

  type Mutation {
    addUser(input: InputUser!): userData
    updateUser(id: String, input: InputUser!): userData
    createConnection(input: GenerateInput!): [createConnectionOutput]
    deleteUser(id: String): deleteUsersData
    addPrompt(question: String!): JSON
    updatePrompt(question: String!): JSON
    sendEmail(input: [sendEmail!]!): JSON
    saveChanges(input: JSON!): JSON
    deleteAllResponsesFromDB: deleteUsersData
  }

  input GenerateInput {
    businessKeyword: String!
    clientKeyword: [String!]!
    prompt: String
    name: [String]
    emailId: [String]
  }

  input sendEmail {
    subject: String!
    body: String!
    name: String!
    toEmail: String!
  }

  input InputUser {
    email: String
    name: String
    password: String
    phone: String
  }

  type Status {
    code: Int
    header: String
    description: String
    moreInfo: String
  }

  type userData {
    status: Status
    data: User
  }

  type createConnectionOutput {
    subject: String
    body: String
  }
`;
