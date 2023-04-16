import { Controller, Get } from '@nestjs/common';
import { LangchainService } from './langchain.service';

@Controller('langchain')
export class LangchainController {
  constructor(private langchainService: LangchainService) {}

  @Get('answer')
  async answer(): Promise<string> {
    return this.langchainService.answer();
  }

  @Get('asyncHello')
  async asyncHello(): Promise<string> {
    return this.langchainService.asyncHello();
  }

  @Get('hello')
  hello(): string {
    return this.langchainService.hello();
  }
}
