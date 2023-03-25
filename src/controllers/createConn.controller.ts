import { Context } from '../models/context';
import { Configuration, OpenAIApi } from 'openai';
const Prompt = require('../models/prompt');
const MessagePrompt = require('../models/mobilePrompt');
const Email = require('../models/email');
import nodemailer from 'nodemailer';
import { successResponse } from '../utils/successResponse';
import puppeteer from 'puppeteer';
const twilio = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

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
          if (line.startsWith('Subject: ')) {
            subject = line;
            subject = subject.replace('Subject: ', '');
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
        if (emailBody.includes("Dear <Name>,")) emailBody = emailBody.replace("Dear <Name>,", '');
        if (emailBody.includes("Dear <name>,")) emailBody = emailBody.replace("Dear <name>,", '');
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
      let number
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
          if (line.startsWith('Subject: ')) {
            subject = line;
            subject = subject.replace('Subject: ', '');
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
        if (emailBody.includes("Dear <Name>,")) emailBody = emailBody.replace("Dear <Name>,", '');
        if (emailBody.includes("Dear <name>,")) emailBody = emailBody.replace("Dear <name>,", '');
        responseToSend = {
          subject,
          body: emailBody,
          name,
          csvName,
          number,
          emailLoggedInUser: inputObject.input.emailLoggedInUser,
        };
        responseToSendArray.push(responseToSend);
        await Email.create(responseToSend);
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
    const prompt = await Prompt.find({ email });
    return prompt[0].question;
  }

  async getMessagePrompt({ email }) {
    const prompt = await MessagePrompt.find({ email });
    return prompt[0].question;
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
          from: process.env.FROM_EMAIL,
          to: inputObject.input[i].toEmail,
          subject: allEmails.subject,
          text: randomSalutation + ' ' + inputObject.input[i].name + '\n' + allEmails.body,
        });
      }
      await Email.deleteMany({});
      return 'Email sent successfully';
    } catch (e) {
      throw new Error(`Error sending email`);
    }
  }

  async sendMessage (inputObject: any) {
    try {
      const { subject, body, name, number } = inputObject.input[0];
      const allEmails = {
        subject,
        body,
        name,
        number,
      };

      const salutations = ['Dear', 'Hey', 'Hello', 'Hey there!'];
      const randomSalutation = salutations[Math.floor(Math.random() * salutations.length)];

      twilio.messages.create({
        to: number,
        from: process.env.TWILIO_NUMBER,
        body: "\n" + "Subject: " + allEmails.subject + "\n" + "Body: " + randomSalutation + "\n" + allEmails.body
      }).then(async (message) => {
        // await Email.deleteMany({});
        console.log(message.sid);
      }).catch((e) => {
        throw new Error(`Error sending message`)
      });

      return 'Message sent successfully';

    } catch (e) {
      throw new Error(e)
    }
  }

  async saveChanges(inputObject) {
    console.log(inputObject);
  }

  async getEmailDataFromDb(args: any) {
    const allEmails = await Email.find({ emailLoggedInUser: args.loggedInEmail });
    return allEmails;
  }

  async deleteAllResponsesFromDB(inputObject) {
    const result = await Email.deleteMany({ emailLoggedInUser: inputObject.loggedInUser });
    return successResponse(result, 'deleted');
  }

  async linkedInMsg() {
    let profileUrl = "https://www.linkedin.com/in/khadija-dh-b02428120/";
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login');
    await page.setViewport({width: 1080, height: 1024});

    // Login to LinkedIn
    await page.type('#username', 'mohammedrafique23@gmail.com');
    await page.type('#password', 'Mhmd@66426633');
    await page.click('button[type="submit"]');

    // Wait for the page to load and navigate to the LinkedIn search page
    await page.waitForNavigation();
    await page.goto(profileUrl);
    await page.waitForTimeout(2000)

    // Click on the message button
    // const messageButtonSelector = 'div.entry-point';
    // await page.waitForSelector(messageButtonSelector);
    // await page.click(messageButtonSelector);
    await page.waitForSelector('.artdeco-button__text');
    await page.click('.artdeco-button__text');


    await page.waitForSelector('.msg-form__subject-input');
    await page.type('.msg-form__subject-input', 'YOUR_SUBJECT');
    await page.type('.msg-form__contenteditable', 'YOUR_MESSAGE_BODY');
    await page.click('.msg-form__send-button');


    // Construct a personalized message to send to the person
    const message = `Hi [Name], I came across your LinkedIn profile and would like to connect with you. [Add personalized message here]`;

    // await browser.close();
    return "Success";
  }
}
