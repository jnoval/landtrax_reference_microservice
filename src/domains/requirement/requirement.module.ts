import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import RequirementEntity from '../../shared/infrastructure/database/entities/requirement.entity';
import { RequirementController } from './controllers/requirement.controller';
import { RequirementService } from './services/requirement.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequirementEntity])],
  controllers: [RequirementController],
  providers: [RequirementService],
  exports: [RequirementService],
})
export class RequirementModule {}
