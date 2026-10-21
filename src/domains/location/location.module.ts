import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistryOfDeedEntity } from '../../shared/infrastructure/database/entities/registry-of-deed.entity';
import { RedisCacheService } from '../../shared/infrastructure/redis/redis-cache.service';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryOfDeedEntity])],
  controllers: [LocationController],
  providers: [LocationService, RedisCacheService],
  exports: [LocationService],
})
export class LocationModule {}
