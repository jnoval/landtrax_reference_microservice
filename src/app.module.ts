import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './config/app.config';
import redisConfig from './config/redis.config';
import { FAQModule } from './domains/faq/faq.module';
import { LocationModule } from './domains/location/location.module';
import { RequirementModule } from './domains/requirement/requirement.module';
import { ServiceCatalogModule } from './domains/service-catalog/service-catalog.module';
import { SystemSettingsModule } from './domains/system-settings/system-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    ServiceCatalogModule,
    RequirementModule,
    SystemSettingsModule,
    LocationModule,
    FAQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
