import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../shared/infrastructure/database/entities/category.entity';
import RequirementMappingEntity from '../../shared/infrastructure/database/entities/requirement-mapping.entity';
import RequirementEntity from '../../shared/infrastructure/database/entities/requirement.entity';
import ServiceEntity from '../../shared/infrastructure/database/entities/service-catalog.entity';
import ServiceChecklistEntity from '../../shared/infrastructure/database/entities/service-checklist.entity';
import { RequirementMappingController } from './controllers/requirement-mapping.controller';
import { ServiceChecklistController } from './controllers/service-checklist.controller';
import { ServiceCatalogController } from './controllers/service.controller';
import { RequirementMappingService } from './services/requirement-mapping.service';
import { ServiceChecklistService } from './services/service-checklist.service';
import { ServiceCatalogService } from './services/service.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      CategoryEntity,
      ServiceChecklistEntity,
      RequirementEntity,
      RequirementMappingEntity,
    ]),
  ],
  controllers: [
    ServiceCatalogController,
    ServiceChecklistController,
    RequirementMappingController,
  ],
  providers: [
    ServiceCatalogService,
    ServiceChecklistService,
    RequirementMappingService,
  ],
  exports: [
    ServiceCatalogService,
    ServiceChecklistService,
    RequirementMappingService,
  ],
})
export class ServiceCatalogModule {}
