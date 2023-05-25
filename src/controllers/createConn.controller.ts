import { Context } from '../models/context';
import { Configuration, OpenAIApi } from 'openai';
const Prompt = require('../models/prompt');
const MessagePrompt = require('../models/mobilePrompt');
const Email = require('../models/email');
const Message = require('../models/messages');
const SentEmails = require('../models/sentEmails');
const SentMessages = require('../models/sentMessages');
const Users = require('../models/users');
import nodemailer from 'nodemailer';
import { successResponse } from '../utils/successResponse';
import puppeteer from 'puppeteer';
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export class CreateConnController {
  async generate(inputObject: any, ctx: Context) {
    try {
      let prompt: String;
      let result;
      let body;
      let subject = 'Subject';
      let clientReplace;
      let response;
      let responseToSend;
      let responseToSendArray = [];
      let emailId;
      let name;
      let company;
      let csvName;
      if (!configuration.apiKey) {
        throw new Error('Api key not found');
      }
      if (!inputObject.input.prompt) {
        const findPrompt = await Prompt.find();
        prompt = findPrompt[0].question;
      } else {
        prompt = inputObject.input.prompt;
      }
      const businessReplace = prompt.replaceAll('<Business Description>', inputObject.input.businessKeyword);
      for (let i = 0; i <= inputObject.input.clientKeyword.length - 1; i++) {
        clientReplace = businessReplace.replace('<Client Description>', inputObject.input.clientKeyword[i]);
        response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: clientReplace,
          max_tokens: 400,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        result = response.data.choices[0].text;
        body = result
          .split('\n')
          .filter((line) => line.trim() !== '')
          .join('\n');
        let lines = body.split('\n');
        let emailBody = '';
        lines.forEach((line) => {
          if (line.startsWith('Subject: ') || line.startsWith('Subject Line: ')) {
            subject = line;
            subject = subject.replace('Subject: ', '');
            subject = subject.replace('Subject Line: ', '');
          } else {
            emailBody += line + '\n';
          }
        });
        if (inputObject.input.csvName) {
          csvName = inputObject.input.csvName[i];
        }
        if (inputObject.input.emailId) {
          emailId = inputObject.input.emailId[i];
        }
        if (emailBody.includes('Dear <Name>,')) emailBody = emailBody.replace('Dear <Name>,', '');
        if (emailBody.includes('Dear <name>,')) emailBody = emailBody.replace('Dear <name>,', '');
        responseToSend = {
          subject,
          body: emailBody,
          name,
          csvName,
          emailId,
          emailLoggedInUser: inputObject.input.emailLoggedInUser,
        };
        responseToSendArray.push(responseToSend);
        await Email.create(responseToSend);
        const checkUserRole = await Users.findOne({ email: inputObject.input.emailLoggedInUser });
        if (checkUserRole.role === 'company admin')
          await Users.updateOne(
            { email: inputObject.input.emailLoggedInUser },
            { $inc: { balance: -0.05 } },
            { new: true, runValidators: true }
          );
        if (checkUserRole.role === 'member') {
          const findCompanyAdmin = await Users.findOne({ email: inputObject.input.emailLoggedInUser });
          const getCompanyAdmin = await Users.findOne({
            company: findCompanyAdmin.company,
            role: 'company admin',
          });
          await Users.updateOne(
            { email: getCompanyAdmin.email },
            { $inc: { balance: -0.05 } },
            { new: true, runValidators: true }
          );
        }
      }
      return responseToSendArray;
    } catch (e) {
      console.log(e);
    }
  }

  async generateForMessage(inputObject: any, ctx: Context) {
    try {
      let prompt: String;
      let result;
      let body;
      let subject = 'Subject';
      let clientReplace;
      let response;
      let responseToSend;
      let responseToSendArray = [];
      let name;
      let company;
      let csvName;
      let number;
      if (!configuration.apiKey) {
        throw new Error('Api key not found');
      }
      if (!inputObject.input.prompt) {
        const findPrompt = await MessagePrompt.find();
        prompt = findPrompt[0].question;
      } else {
        prompt = inputObject.input.prompt;
      }
      const businessReplace = prompt.replaceAll('<Business Description>', inputObject.input.businessKeyword);
      for (let i = 0; i <= inputObject.input.clientKeyword.length - 1; i++) {
        clientReplace = businessReplace.replace('<Client Description>', inputObject.input.clientKeyword[i]);
        response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: clientReplace,
          max_tokens: 400,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        result = response.data.choices[0].text;
        body = result
          .split('\n')
          .filter((line) => line.trim() !== '')
          .join('\n');
        let lines = body.split('\n');
        let emailBody = '';
        lines.forEach((line) => {
          if (line.startsWith('Subject: ') || line.startsWith('Subject Line: ')) {
            subject = line;
            subject = subject.replace('Subject: ', '');
            subject = subject.replace('Subject Line: ', '');
          } else {
            emailBody += line + '\n';
          }
        });
        if (inputObject.input.csvName) {
          csvName = inputObject.input.csvName[i];
        }
        if (inputObject.input.number) {
          number = inputObject.input.number[i];
        }
        if (emailBody.includes('Dear <Name>,')) emailBody = emailBody.replace('Dear <Name>,', '');
        if (emailBody.includes('Dear <name>,')) emailBody = emailBody.replace('Dear <name>,', '');
        responseToSend = {
          body: emailBody,
          name,
          csvName,
          number,
          emailLoggedInUser: inputObject.input.emailLoggedInUser,
        };
        responseToSendArray.push(responseToSend);
        await Message.create(responseToSend);
        const checkUserRole = await Users.findOne({ email: inputObject.input.emailLoggedInUser });
        if (checkUserRole.role === 'company admin')
          await Users.updateOne(
            { email: inputObject.input.emailLoggedInUser },
            { $inc: { balance: -0.025 } },
            { new: true, runValidators: true }
          );
        if (checkUserRole.role === 'member') {
          const findCompanyAdmin = await Users.findOne({ email: inputObject.input.emailLoggedInUser });
          const getCompanyAdmin = await Users.findOne({
            company: findCompanyAdmin.company,
            role: 'company admin',
          });
          await Users.updateOne(
            { email: getCompanyAdmin.email },
            { $inc: { balance: -0.025 } },
            { new: true, runValidators: true }
          );
        }
      }
      return responseToSendArray;
    } catch (e) {
      console.log(e);
    }
  }

  async addPrompt(inputObject: any, ctx: Context) {
    try {
      await Prompt.deleteOne({ email: inputObject.email });
      await Prompt.create(inputObject);
      return 'Question Inserted';
    } catch (e) {
      return 'Question not inserted, please check console for error';
    }
  }

  async addMessagePrompt(inputObject: any, ctx: Context) {
    try {
      await MessagePrompt.deleteOne({ email: inputObject.email });
      await MessagePrompt.create(inputObject);
      return 'Question Inserted';
    } catch (e) {
      return 'Question not inserted, please check console for error';
    }
  }

  async getPrompt({ email }) {
    const prompt = await Prompt.findOne({ email });
    return {
      status: prompt.locked,
      question: prompt.question,
    };
  }

  async getMessagePrompt({ email }) {
    const prompt = await MessagePrompt.findOne({ email });
    return {
      status: prompt.locked,
      question: prompt.question,
    };
  }

  async updatePrompt(inputObject: any, ctx: Context) {
    try {
      const getIdPrompt = await Prompt.findOne({ email: inputObject.email });
      await Prompt.findOneAndUpdate({ _id: getIdPrompt._id }, inputObject);
      return 'Question Updated';
    } catch (e) {
      return 'Question not updated, please check console for error';
    }
  }

  async updateMessagePrompt(inputObject: any, ctx: Context) {
    try {
      const getIdPrompt = await MessagePrompt.findOne({ email: inputObject.email });
      await MessagePrompt.findOneAndUpdate({ _id: getIdPrompt[0]._id }, inputObject);
      return 'Question Updated';
    } catch (e) {
      return 'Question not updated, please check console for error';
    }
  }

  async sendEmail(inputObject: any) {
    try {
      const { subject, body, name, toEmail, fromEmail, app_password } = inputObject.input[0];
      const allEmails = {
        subject,
        body,
        name,
        email: toEmail,
      };
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: fromEmail,
          pass: app_password,
        },
      });
      const salutations = ['Dear', 'Hey', 'Hello', 'Hey there!'];
      const randomSalutation = salutations[Math.floor(Math.random() * salutations.length)];
      for (let i = 0; i <= inputObject.input.length - 1; i++) {
        await transporter.sendMail({
          from: fromEmail,
          to: inputObject.input[i].toEmail,
          subject: allEmails.subject,
          text: randomSalutation + ' ' + inputObject.input[i].name + '\n' + allEmails.body,
        });
        await SentEmails.create({
          toEmail: inputObject.input[i].toEmail,
          fromEmail: inputObject.input[i].fromEmail,
          toName: inputObject.input[i].name,
          body: allEmails.subject + '\n' + allEmails.body,
        });
      }
      await Email.deleteMany({ emailLoggedInUser: fromEmail });
      return 'Email sent successfully';
    } catch (e) {
      throw new Error(`Error sending email`);
    }
  }

  async sendMessage(inputObject: any) {
    try {
      const { body, name, number, fromEmail } = inputObject.input[0];
      const allEmails = {
        body,
        name,
        number,
      };

      const salutations = ['Dear', 'Hey', 'Hello', 'Hey there!'];
      const randomSalutation = salutations[Math.floor(Math.random() * salutations.length)];

      twilio.messages
        .create({
          to: number,
          from: process.env.TWILIO_NUMBER,
          body: randomSalutation + '\n' + allEmails.body,
        })
        .then(async (message) => {
          await Message.deleteMany({});
          console.log(message.sid);
        })
        .catch((e) => {
          throw new Error(`Error sending message`);
        });
      await SentMessages.create({
        toNumber: number,
        fromEmail,
        toName: name,
        body: allEmails.body,
      });
      await Message.deleteMany({});
      return 'Message sent successfully';
    } catch (e) {
      throw new Error(e);
    }
  }

  async saveChanges(inputObject) {
    console.log(inputObject);
  }

  async getEmailDataFromDb(args: any) {
    const allEmails = await Email.find({ emailLoggedInUser: args.loggedInEmail });
    return allEmails;
  }

  async getMsgDataFromDb(args: any) {
    const allMsgs = await Message.find({ emailLoggedInUser: args.loggedInEmail });
    return allMsgs;
  }

  async deleteAllResponsesFromDB(inputObject) {
    const result = await Email.deleteMany({ emailLoggedInUser: inputObject.loggedInUser });
    const msgResult = await Message.deleteMany({ emailLoggedInUser: inputObject.loggedInUser });
    return successResponse({ result, msgResult }, 'deleted');
  }

  async viewAllEmailsSent({ id, company }: any) {
    try {
      const getCurrentUser = await Users.findOne({ _id: id });
      if (!getCurrentUser) 'Cannot find any such user';
      if (getCurrentUser.role === 'super admin') {
        const sentEmails = await SentEmails.find({});
        return sentEmails;
      }
      if (getCurrentUser.role === 'company admin') {
        const sentEmails = await SentEmails.find({ company });
        return sentEmails;
      }
      return 'Unauthorised access';
    } catch (err) {
      throw new Error(err);
    }
  }

  async viewAllMessagesSent({ id, company }: any) {
    try {
      const getCurrentUser = await Users.findOne({ _id: id });
      if (!getCurrentUser) 'Cannot find any such user';
      if (getCurrentUser.role === 'super admin') {
        const sentMessages = await SentMessages.find({});
        return sentMessages;
      }
      if (getCurrentUser.role === 'company admin') {
        const sentMessages = await SentMessages.find({ company });
        return sentMessages;
      }
      return 'Unauthorised access';
    } catch (err) {
      throw new Error(err);
    }
  }
}
