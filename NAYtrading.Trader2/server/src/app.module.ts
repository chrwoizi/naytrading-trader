import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import * as fs from 'fs';
import * as path from 'path';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BaseEntity } from './base-entity.entity';
import { getConnectionString } from './connection-string';
import { Repo } from './helpers/repo';
import { NaytradingModule } from './naytrading/NaytradingModule';

const envFiles = ['.env'];
const nodeEnvFile = `.${process.env.NODE_ENV || 'development'}.env`;
if (fs.existsSync(nodeEnvFile)) {
  envFiles.unshift(nodeEnvFile);
}
console.log(envFiles);

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFiles,
      isGlobal: true
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mongo',
        clientUrl: getConnectionString(config),
        autoLoadEntities: true,
        entities: [BaseEntity],
        highlighter: new MongoHighlighter(),
        debug: false,
        ensureIndexes: true,
        entityRepository: Repo
      })
    }),
    ServeStaticModule.forRoot({
      renderPath: '/test',
      rootPath: path.join(__dirname, '..', 'static')
    }),
    AuthModule,
    AdminModule,
    NaytradingModule
  ]
})
export class AppModule {}
