import { gql } from 'apollo-server';

export default gql`
  scalar JSON
  scalar Date
  type User {
    email: String
    name: String
    phone: String
    password: String
    app_password: String
    company: String
    position: String
    role: String
  }

  type Query {
    getUsers(input: getUserInput): JSON
    findByUserId(id: String!): findByUserIdData
    token(email: String!): String!
    getEmails(loggedInEmail: String!): [emailsDataOutput]!
    getMsgs(loggedInEmail: String!): [msgsDataOutput]!
    getPrompt(email: String!): JSON
    getMessagePrompt(email: String!): JSON
    getUserCompanyAdmin(company: String!, role: String!): JSON
    getUserBalance(email: String!, company: String!, role: String!): JSON
  }

  input getUserInput {
    email: String
    password: String
  }

  type emailsDataOutput {
    subject: String!
    body: String!
    csvName: String
    name: String
    emailId: String
    number: String
  }

  type msgsDataOutput {
    body: String!
    csvName: String
    name: String
    number: String
  }

  type getUsersData {
    token: String
    data: User
  }

  type findByUserIdData {
    status: Status
    data: User
  }

  type deleteUsersData {
    status: Status
  }

  input resetPassword {
    password: String!
    token: String!
  }

  type allUsers {
    name: String
    email: String
    phone: String
    company: String
    position: String
    role: String
    balance: Int
    createdAt: Date
  }

  type sentEmails {
    toEmail: String
    toName: String
    fromEmail: String
    body: String
    company: String
  }

  type sentMessages {
    toNumber: String
    toName: String
    fromEmail: String
    body: String
    company: String
  }

  type Mutation {
    addUser(input: InputUser!): userData
    updateUser(email: String, input: InputUser): userData
    sendResetPasswordEmail(email: String!): JSON
    resetPassword(input: resetPassword): JSON
    createConnection(input: GenerateInput!): [createConnectionOutput]
    createConnectionForMessage(input: GenerateInputMessage!): [createConnectionOutput]
    deleteUser(email: String): deleteUsersData
    addPrompt(question: String!, email: String!): JSON
    addMessagePrompt(question: String!, email: String!): JSON
    updatePrompt(question: String!, email: String!): JSON
    updateMessagePrompt(question: String!, email: String!): JSON
    sendEmail(input: [sendEmail!]!): JSON
    sendMessage(input: [sendMessage!]!): JSON
    saveChanges(input: JSON!): JSON
    deleteAllResponsesFromDB(loggedInUser: String!): deleteUsersData
    returnToken(token: String): JSON
    getAllUsers(id: String!, regex: String): [allUsers!]!
    viewAllEmailsSent(id: String!, company: String): [sentEmails!]!
    viewAllMessagesSent(id: String!, company: String): [sentMessages!]!
    capturePayment(amount: Int!, email: String!, token: String!): JSON
  }

  input GenerateInput {
    businessKeyword: String!
    clientKeyword: [String!]!
    prompt: String
    name: String
    emailId: [String]
    company: String
    csvName: [String]
    emailLoggedInUser: String!
  }

  input GenerateInputMessage {
    businessKeyword: String!
    clientKeyword: [String!]!
    prompt: String
    name: String
    number: [String]
    company: String
    csvName: [String]
    emailLoggedInUser: String!
  }

  input sendEmail {
    subject: String!
    body: String!
    name: String!
    toEmail: String!
    fromEmail: String!
    app_password: String!
    company: String
  }

  input sendMessage {
    body: String!
    name: String!
    number: String!
    fromEmail: String!
    company: String
  }

  input InputUser {
    email: String
    name: String
    password: String
    phone: String
    app_password: String
    company: String
    position: String
    role: String
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
