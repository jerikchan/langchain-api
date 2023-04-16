import { Injectable } from '@nestjs/common';
import { OpenAI } from 'langchain/llms/openai';
// import { CallbackManager } from 'langchain/callbacks';
// import { LLMResult } from 'langchain/schema';

// const callbackManager = CallbackManager.fromHandlers({
//   handleLLMStart: async (llm: { name: string }, prompts: string[]) => {
//     console.log(JSON.stringify(llm, null, 2));
//     console.log(JSON.stringify(prompts, null, 2));
//   },
//   handleLLMEnd: async (output: LLMResult) => {
//     console.log(JSON.stringify(output, null, 2));
//   },
//   handleLLMError: async (err: Error) => {
//     console.error(err);
//   },
// });

const model = new OpenAI({
  temperature: 0.9,
  openAIApiKey: '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', // In Node.js defaults to process.env.OPENAI_API_KEY
  // callbackManager,
});

export async function callModel() {
  const res = await model.call(
    'What would be a good company name a company that makes colorful socks?',
  );
  return res;
}

@Injectable()
export class LangchainService {
  async answer(): Promise<string> {
    return callModel();
  }

  async asyncHello(): Promise<string> {
    return Promise.resolve('asyncHello');
  }

  hello(): string {
    return 'hello';
  }
}
