import { Controller, Get, Query, Header } from '@nestjs/common';
import { LangchainService } from './langchain.service';

@Controller('langchain')
export class LangchainController {
  constructor(private langchainService: LangchainService) {}

  @Get('answer')
  async answer(@Query('question') question: string): Promise<string> {
    return this.langchainService.answer(question);
  }

  @Get('asyncHello')
  async asyncHello(): Promise<string> {
    return this.langchainService.asyncHello();
  }

  @Get('hello')
  hello(): string {
    return this.langchainService.hello();
  }

  @Get('summarize')
  async summarize(): Promise<string> {
    return this.langchainService.summarize();
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Get('conversationalRetrievalQA')
  async conversationalRetrievalQA(@Query('question') question: string, @Query('chat_history') chat_history: string[]): Promise<string> {
    return this.langchainService.conversationalRetrievalQA(question, chat_history);
  }
}
