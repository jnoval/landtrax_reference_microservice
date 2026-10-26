import { CategoryEntity } from './category.entity';
import FAQEntity from './faq.entity';
import { BaseEntity, LineEntity } from './general.entity';
import { LocationEntity } from './location.entity';
import RequirementMappingEntity from './requirement-mapping.entity';
import RequirementEntity from './requirement.entity';
import ServiceEntity from './service-catalog.entity';
import ServiceChecklistEntity from './service-checklist.entity';
import SystemSettingEntity from './system-setting.entity';
import TransactionEntity from './transaction.entity';
import UserEntity from './user.entity';
import UserCompanyEntity from './user-company.entity';

export const Entities = {
  CategoryEntity,
  ServiceEntity,
  ServiceChecklistEntity,
  RequirementEntity,
  RequirementMappingEntity,
  SystemSettingEntity,
  LocationEntity,
  FAQEntity,
  UserEntity,
  UserCompanyEntity,
  TransactionEntity,
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
  LocationEntity,
  FAQEntity,
  UserEntity,
  UserCompanyEntity,
  TransactionEntity,
};

export default Entities;
