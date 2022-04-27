import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from './ConfigKey';

export function getConnectionString(
  config: ConfigService<Record<string, any>>
) {
  const user = config.get<string>(ConfigKey.MONGO_USERNAME);
  const password = config.get<string>(ConfigKey.MONGO_PASSWORD);
  const host = config.get<string>(ConfigKey.MONGO_HOSTNAME);
  const port = config.get<number>(ConfigKey.MONGO_PORT);
  const db = config.get<string>(ConfigKey.MONGO_DB);
  const uri = `mongodb://${user}:${password}@${host}:${port}/${db}`;

  Logger.log(
    `mongodb://${user}:${password.substr(0, 1)}***${password.substr(
      password.length - 1,
      1
    )}@${host}:${port}/${db}`,
    'MONGODB'
  );

  return uri;
}
