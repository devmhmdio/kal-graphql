import { Context } from '../models/context';
import { buildErrorResponse } from '../utils/buildErrorResponse';
import { successResponse } from '../utils/successResponse';
import { Configuration, OpenAIApi } from 'openai';
const Prompt = require('../models/prompt');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export class CreateConnController {
  async generate(inputObject: any, ctx: Context) {
    try {
      let prompt;
      if (!configuration.apiKey) {
        throw new Error('Api key not found');
      }
      console.log('this is input object', inputObject);
      if (!inputObject.input.prompt) {
        prompt = await Prompt.find();
      } else {
        prompt = inputObject.input.prompt;
      }
      const businessReplace = prompt.replace('<Business Description>', inputObject.input.businessKeyword);
      const clientReplace = prompt.replace('<Client Description>', inputObject.input.clientKeyword);
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: clientReplace,
        max_tokens: 400,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      return {
        result: response.data.choices[0].text,
      };
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
}
