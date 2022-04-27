import { MikroORM } from '@mikro-orm/core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from './ConfigKey';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private configService: ConfigService, private orm: MikroORM) {}

  async onModuleInit() {
    /*    const client = await MongoClient.connect(
      getConnectionString(this.configService),
      {
        useNewUrlParser: true,
      },
    );

    try {
      await client
        .db()
        .collection('workerresults')
        .updateMany(
          { ...filter... },
          {
            $rename: {
              ...
            },
            $set: {
              ...
            },
          },
        );
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.close();
    }*/
  }

  getHello(): string {
    return 'Hello from ' + this.configService.get<string>(ConfigKey.APP_NAME);
  }
}
