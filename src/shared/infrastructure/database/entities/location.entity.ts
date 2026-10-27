import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ENTITY } from '../models/general-model';
import { BaseEntity } from './general.entity';
import TransactionEntity from './transaction.entity';
import UserEntity from './user.entity';

@Index('UQ_Location_Name_Active', ['name'], { unique: true, where: 'DeletedDate IS NULL' })
@Entity(ENTITY.LOCATION)
export class LocationEntity extends BaseEntity {
  @Column({ name: 'Name', type: 'varchar', length: 255, nullable: false, unique:true })
  name!: string;

  @Column({ name: 'Abbreviation', type: 'varchar', length: 100, nullable: true })
  abbreviation!: string | null;

  @Column({ name: 'Address', type: 'varchar', length: 500, nullable: true })
  address!: string | null;

  @Column({ name: 'IsActive', type: 'bit', nullable: false, default: true })
  isActive!: boolean;

  @OneToMany(() => UserEntity, (user) => user.location, { eager: false })
  users?: UserEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.location, { eager: false })
  transactions?: TransactionEntity[];
}
