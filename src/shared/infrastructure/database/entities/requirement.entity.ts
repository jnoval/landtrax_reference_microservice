import { Column, Entity, OneToMany } from 'typeorm';
import { ENTITY } from '../models/general-model';
import { BaseEntity } from './general.entity';
import RequirementMappingEntity from './requirement-mapping.entity';
import ServiceChecklistEntity from './service-checklist.entity';

export type RequirementType = 'DOCUMENT' | 'INFORMATION';

@Entity(ENTITY.REQUIREMENT)
export class RequirementEntity extends BaseEntity {
  @Column({ name: 'RequirementCode', type: 'varchar', length: 255, nullable: false })
  requirementCode!: string;

  @Column({ name: 'Name', type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'Type', type: 'varchar', length: 255, nullable: false })
  type!: RequirementType;

  @Column({ name: 'IsActive', type: 'bit', nullable: false, default: true })
  isActive!: boolean;

  @Column({ name: 'AcceptedFileTypes', type: 'text', nullable: true, default: 'jpeg,jpg,png,pdf' })
  acceptedFileTypes!: string | null;

  @Column({ name: 'AcceptedGovernmentIds', type: 'text', nullable: true, default: null })
  acceptedGovernmentIds!: string | null;

  @Column({ name: 'MaxFileSize', type: 'int', nullable: true, default: 25 })
  maxFileSize!: number | null;

  @Column({ name: 'MinFiles', type: 'int', nullable: true, default: null })
  minFiles!: number | null;

  @Column({ name: 'MaxFiles', type: 'int', nullable: true, default: 1 })
  maxFiles!: number | null;

  @Column({
    name: 'FileNameFormat',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  fileNameFormat!: string | null;

  @Column({
    name: 'IsOptional',
    type: 'bit',
    nullable: false,
    default: false,
  })
  isOptional!: boolean;

  @Column({
    name: 'Placeholder',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  placeholder!: string | null;

  @Column({
    name: 'ClassificationPrompt',
    type: 'text',
    nullable: true,
  })
  classificationPrompt?: string | null;

  @Column({
    name: 'IsClassificationEnabled',
    type: 'bit',
    nullable: false,
    default: false,
  })
  isClassificationEnabled!: boolean;

  @OneToMany(() => ServiceChecklistEntity, (serviceChecklist) => serviceChecklist.requirement, {
    eager: false,
  })
  serviceChecklists?: ServiceChecklistEntity[];

  @OneToMany(
    () => RequirementMappingEntity,
    (requirementMapping) => requirementMapping.sourceRequirement,
    { eager: false },
  )
  sourceRequirementMappings?: RequirementMappingEntity[];
}

export default RequirementEntity;

