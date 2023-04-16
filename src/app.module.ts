import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LangchainModule } from './langchain/langchain.module';

@Module({
  imports: [LangchainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
