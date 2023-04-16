import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import fetch from 'node-fetch';
// import { HttpsProxyAgent } from 'https-proxy-agent';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// const proxyAgent = new HttpsProxyAgent('http://localhost:7890')!;
// global.fetch = function proxyFetch(endpoint: any, options) {
//   const opts: any = {
//     ...options,
//     agent: proxyAgent,
//   };
//   return fetch(endpoint, opts);
// } as any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
