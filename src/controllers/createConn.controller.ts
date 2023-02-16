import { Context } from '../models/context';
import { Configuration, OpenAIApi } from 'openai';
const Prompt = require('../models/prompt');
const Email = require('../models/email');
import nodemailer from 'nodemailer';

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
      if (!configuration.apiKey) {
        throw new Error('Api key not found');
      }
      if (!inputObject.input.prompt) {
        const findPrompt = await Prompt.find();
        prompt = findPrompt[0].question;
      } else {
        prompt = inputObject.input.prompt;
      }
      const businessReplace = prompt.replace('<Business Description>', inputObject.input.businessKeyword);
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
          if (line.startsWith('Subject: ')) {
            subject = line;
            subject = subject.replace('Subject: ', '');
          } else {
            emailBody += line + '\n';
          }
        });
        responseToSend = {
          subject,
          body: emailBody,
        };
        responseToSendArray.push(responseToSend);
        await Email.create(responseToSend)
      }
      return responseToSendArray;
    } catch (e) {
      console.log(e);
    }
  }

  async addPrompt(inputObject: any, ctx: Context) {
    try {
      await Prompt.create(inputObject);
      return 'Question Inserted';
    } catch (e) {
      console.log(e);
      return 'Question not inserted, please check console for error';
    }
  }

  async sendEmail(inputObject: any) {
    try {
      const { subject, body, name, toEmail } = inputObject.input[0];
      const allEmails = {
        subject,
        body,
        name,
        email: toEmail
      };
      console.log('line 91', allEmails)
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.FROM_PASS,
        },
      });
      const salutations = ['Dear', 'Hey', 'Hello', 'Hey there!'];
      const randomSalutation = salutations[Math.floor(Math.random() * salutations.length)];
      for (let i = 0; i <= inputObject.input.length - 1; i++) {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: inputObject.input[i].toEmail,
          subject: allEmails.subject,
          text: randomSalutation + ' ' + inputObject.input[i].name + '\n' + allEmails.body,
        });
      }
      await Email.deleteMany({});
      return 'Email sent successfully';
    } catch (e) {
      console.log(e);
      throw new Error(`Error sending email`);
    }
  }

  async saveChanges(inputObject) {
    console.log(inputObject)
  }

  async getEmailDataFromDb() {
    const allEmails = await Email.find({});
    return allEmails;
  }
}
