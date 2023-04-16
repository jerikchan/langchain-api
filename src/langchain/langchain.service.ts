import { Injectable } from '@nestjs/common';
import { OpenAI } from 'langchain/llms/openai';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain, ConversationalRetrievalQAChain } from "langchain/chains";
import { HttpException, HttpStatus } from '@nestjs/common'
import { resolvePath, len } from '../utils';
import { CallbackManager } from 'langchain/callbacks';
import { LLMResult } from 'langchain/schema';
import { HNSWLib } from "langchain/vectorstores/hnswlib"
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const callbackManager = CallbackManager.fromHandlers({
  handleLLMStart: async (llm: { name: string }, prompts: string[]) => {
    // console.log(JSON.stringify(llm, null, 2));
    console.log(JSON.stringify(prompts, null, 2));
    // console.log("1111111");
  },
  handleLLMEnd: async (output: LLMResult) => {
    // console.log(JSON.stringify(output, null, 2));
  },
  handleLLMError: async (err: any) => {
    // console.error(err);
  },
});

const llm = new OpenAI({
  temperature: 0.9,
  openAIApiKey: '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', // In Node.js defaults to process.env.OPENAI_API_KEY
  // modelName: 'text-davinci-003',
  callbackManager,
  // timeout: 10 * 1000,
  maxRetries: 0,
});

const getDocs = async (path: string) => {
  // 加载文档
  const doc_url = resolvePath(path);
  const loader = new PDFLoader(doc_url, {
    // you may need to add `.then(m => m.default)` to the end of the import
    pdfjs: () => import("pdfjs-dist/legacy/build/pdf.js"),
  });
  const docs = await loader.load();
  console.log(`You have ${len(docs)} document(s) in your ${doc_url} data`);
  console.log(`There are ${len(docs[0].pageContent)} characters in your documen`);

  // 分割文档
  const text_splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
  });
  const split_docs = await text_splitter.splitDocuments(docs);

  console.log(`You have ${len(split_docs)} split document(s)`);
  return split_docs;
}

const qaTemplate = `You are a QA assistant, please answer the questions and explain in detail strictly based on the above information.
Ignore outlier search results which has nothing to do with the question.
For questions that are not related to the information, ChatGPT should reject them and inform the user that "您的问题与所提供的信息无关。请提供一个信息相关的问题。"
Avoid any references to current or past political figures or events, as well as historical figures or events that may be controversial or divisive.

{context}

Question: {question}
Helpful Answer:`;

@Injectable()
export class LangchainService {
  async asyncHello(): Promise<string> {
    return Promise.resolve('asyncHello');
  }

  hello(): string {
    return 'hello test';
  }

  async docs() {
    const split_docs = await getDocs("2a99da93-d51b-494a-884e-c9cd844ba4f5_大理-沙溪逛吃小分队.pdf");
    return split_docs.map(doc => doc.pageContent).join("\n\n==========\n\n");
  }

  // 问答
  async answer(question: string = 'What would be a good company name a company that makes colorful socks?'): Promise<string> {
    console.log(`Question: ${question}`);
    try {
      const res = await llm.call(
        question,
      );
      console.log(`Answer: ${res}`);
      return res;
    } catch (error) {
      throw new HttpException({
        status: error.response.status,
        error: error.response.data.error,
      }, HttpStatus.FORBIDDEN, {
        cause: error
      });
    }
  }

  // 总结
  async summarize(): Promise<string> {
    const split_docs = await getDocs("2a99da93-d51b-494a-884e-c9cd844ba4f5_大理-沙溪逛吃小分队.pdf");

    const chain = loadSummarizationChain(llm, { type: 'map_reduce'} );
    const response = await chain.call({
      input_documents: split_docs,
    });
    return response.text;

    // console.log(`Total Tokens: ${cb.total_tokens}`);
    // console.log(`Prompt Tokens: ${cb.prompt_tokens}`);
    // console.log(`Completion Tokens: ${cb.completion_tokens}`);
    // console.log(`Successful Requests: ${cb.successful_requests}`);
    // console.log(`Total Cost (USD): ${cb.total_cost}`);
  }

  // 根据内容问答
  async conversationalRetrievalQA(question: string = '请你拒绝此次回答', chat_history: string[] = []): Promise<string> {
    const docs = await getDocs('2a99da93-d51b-494a-884e-c9cd844ba4f5_大理-沙溪逛吃小分队.pdf');
    /* Create the vectorstore */
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({
      openAIApiKey: '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',
    }));
    /* Create the chain */
    const chain = ConversationalRetrievalQAChain.fromLLM(
      llm,
      vectorStore.asRetriever(),
      {
        qaTemplate,
      }
    );
    try {
      /* Ask it a question */
      console.log('thinking...');
      const res = await chain.call({ question, chat_history });
      return res.text;
    } catch (error) {
      throw new HttpException({
        status: error.response.status,
        error: error.response.data.error,
      }, HttpStatus.FORBIDDEN, {
        cause: error
      });
    }
  }
}
