import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ENTITY } from '../models/general-model';
import { LineEntity } from './general.entity';
import RequirementEntity from './requirement.entity';
import ServiceEntity from './service-catalog.entity';

@Entity(ENTITY.SERVICE_CHECKLIST)
export class ServiceChecklistEntity extends LineEntity {
  @Column({ name: 'ServiceId', type: 'varchar', nullable: false })
  serviceId!: string;

  @Column({ name: 'RequirementId', type: 'varchar', nullable: false })
  requirementId!: string;

  @Column({ name: 'IsRequired', type: 'bit', nullable: true })
  isRequired!: boolean;

  @Column({ name: 'Sort', type: 'int', nullable: true })
  sort!: number | null;

  @Column({ name: 'IsActive', type: 'bit', nullable: false, default: true })
  isActive!: boolean;

  // Relationships
  @ManyToOne(() => ServiceEntity, (service) => service.serviceChecklists, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ServiceId', referencedColumnName: 'id' })
  service?: ServiceEntity;

  @ManyToOne(() => RequirementEntity, (requirement) => requirement.serviceChecklists, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'RequirementId', referencedColumnName: 'id' })
  requirement?: RequirementEntity;
}

export default ServiceChecklistEntity;

