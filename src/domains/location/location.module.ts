import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../../shared/infrastructure/database/entities/location.entity';
import { RedisCacheService } from '../../shared/infrastructure/redis/redis-cache.service';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity])],
  controllers: [LocationController],
  providers: [LocationService, RedisCacheService],
  exports: [LocationService],
})
export class LocationModule {}
