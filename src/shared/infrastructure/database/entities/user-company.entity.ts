import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ENTITY } from '../models/general-model';
import { LineEntity } from './general.entity';
import UserEntity from './user.entity';

@Entity(ENTITY.USER_COMPANY)
export default class UserCompanyEntity extends LineEntity {
  @Column({ name: 'UserId', type: 'varchar', nullable: false })
  userId!: string;

  @Column({ name: 'CompanyId', type: 'varchar', nullable: false })
  companyId!: string;

  @Column({ name: 'IsPrimaryAdmin', type: 'varchar', nullable: false })
  isPrimaryAdmin!: string;

  @ManyToOne(() => UserEntity, (user) => user.userCompanies, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'UserId' })
  user!: UserEntity;
}
