import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Entities from '../shared/infrastructure/database/entities/index';

export const getTypeOrmConfig = (configService: ConfigService): any => {
  const DB_HOST = configService.get<string>('DB_HOST') || process.env.DB_HOST || 'localhost';
  const DB_PORT = Number.parseInt(configService.get('DB_PORT') || process.env.DB_PORT || '1433', 10);
  const DB_NAME = configService.get<string>('DB_NAME') || process.env.DB_NAME;
  const DB_USER = configService.get<string>('DB_USER') || process.env.DB_USER || 'sa';
  const DB_PASS = configService.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD || '';

  return {
    type: 'mssql',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    entities: Object.values(Entities),
    synchronize: false,
    dropSchema: false,
    options: {
      enableArithAbort: true,
      trustServerCertificate: true,
    },
    logging: process.env.ENABLE_QUERY_LOGGING === 'true' ? ['query', 'error'] : false,
    retryAttempts: 10,
    retryDelay: 3000,
  };
};

export default new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  entities: Object.values(Entities),
  synchronize: false,
  options: {
    enableArithAbort: true,
    trustServerCertificate: true,
  },
});
