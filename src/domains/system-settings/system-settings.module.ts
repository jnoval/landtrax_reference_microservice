import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SystemSettingEntity from '../../shared/infrastructure/database/entities/system-setting.entity';
import { RedisCacheService } from '../../shared/infrastructure/redis/redis-cache.service';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { SystemSettingsService } from './services/system-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettingEntity])],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, RedisCacheService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
