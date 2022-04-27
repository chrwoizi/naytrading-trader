import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ConfigKey } from './ConfigKey';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>('ConfigService');

  const name = configService.get<string>(ConfigKey.APP_NAME);
  const description = configService.get<string>(ConfigKey.APP_DESCRIPTION);
  const port = configService.get<number>(ConfigKey.APP_PORT);

  const options = new DocumentBuilder()
    .setTitle(name)
    .setDescription(description)
    .setVersion('1.0')
    .addTag(name)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync('./openapi.json', JSON.stringify(document));
  SwaggerModule.setup('api', app, document);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
  await app.listen(port);
};
bootstrap();
