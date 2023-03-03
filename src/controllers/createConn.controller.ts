import { Context } from '../models/context';
import { Configuration, OpenAIApi } from 'openai';
const Prompt = require('../models/prompt');
const Email = require('../models/email');
import nodemailer from 'nodemailer';
import { successResponse } from '../utils/successResponse';
import puppeteer from 'puppeteer';

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
        if (inputObject.input.name && inputObject.input.emailId) {
          name = inputObject.input.name[i];
          emailId = inputObject.input.emailId[i];
        }
        responseToSend = {
          subject,
          body: emailBody,
          name,
          emailId,
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
      await Prompt.deleteMany({});
      await Prompt.create(inputObject);
      return 'Question Inserted';
    } catch (e) {
      console.log(e);
      return 'Question not inserted, please check console for error';
    }
  }

  async getPrompt() {
    const prompt = await Prompt.find({});
    return prompt[0].question;
  }

  async updatePrompt(inputObject: any, ctx: Context) {
    try {
      const getIdPrompt = await Prompt.find({});
      await Prompt.findOneAndUpdate({ _id: getIdPrompt[0]._id }, inputObject);
      return 'Question Updated';
    } catch (e) {
      console.log(e);
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
      console.log(e);
      throw new Error(`Error sending email`);
    }
  }

  async saveChanges(inputObject) {
    console.log(inputObject);
  }

  async getEmailDataFromDb() {
    const allEmails = await Email.find({});
    return allEmails;
  }

  async deleteAllResponsesFromDB() {
    const result = await Email.deleteMany({});
    return successResponse(result, 'deleted');
  }

  async linkedInMsg() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login');

    // Login to LinkedIn
    await page.type('#username', 'mohammedrafique23@gmail.com');
    await page.type('#password', 'Mhmd@66426633');
    await page.click('button[type="submit"]');

    // Wait for the page to load and navigate to the LinkedIn search page
    await page.waitForNavigation();
    const downButtonSelector = 'button[.msg-overlay-bubble-header__control]';
    await page.waitForSelector(downButtonSelector);
    await page.click(downButtonSelector);
    await page.goto('https://www.linkedin.com/search/results/people/');

    // Enter the email address of the person you want to search for
    // await page.type('input[aria-label="Click to start a search"]', "khadijadhariwala11@gmail.com");
    const searchButtonSelector = 'button[aria-label="Click to start a search"]';
    await page.waitForSelector(searchButtonSelector);
    await page.click(searchButtonSelector);
    await page.type('input[aria-label="Search"]', "khadijadhariwala11@gmail.com");
    // await page.click('[type="submit"]');
    await page.keyboard.press('Enter');

    // Wait for the page to load and extract the URL of the person's LinkedIn profile
    await page.waitForNavigation();

    // const profileUrl = await page.evaluate(() => {
    //   return document.querySelector('.search-result__result-link').href;
    // });

    // Construct a personalized message to send to the person
    const message = `Hi [Name], I came across your LinkedIn profile and would like to connect with you. [Add personalized message here]`;

    // await browser.close();
  }
}
