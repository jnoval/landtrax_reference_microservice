import { CategoryEntity } from './category.entity';
import FAQEntity from './faq.entity';
import { BaseEntity, LineEntity } from './general.entity';
import { RegistryOfDeedEntity } from './registry-of-deed.entity';
import RequirementMappingEntity from './requirement-mapping.entity';
import RequirementEntity from './requirement.entity';
import ServiceEntity from './service-catalog.entity';
import ServiceChecklistEntity from './service-checklist.entity';
import SystemSettingEntity from './system-setting.entity';

export const Entities = {
  CategoryEntity,
  ServiceEntity,
  ServiceChecklistEntity,
  RequirementEntity,
  RequirementMappingEntity,
  SystemSettingEntity,
  RegistryOfDeedEntity,
  FAQEntity,
};

export {
  BaseEntity,
  LineEntity,
  CategoryEntity,
  ServiceEntity,
  ServiceChecklistEntity,
  RequirementEntity,
  RequirementMappingEntity,
  SystemSettingEntity,
  RegistryOfDeedEntity,
  FAQEntity,
};

export default Entities;
