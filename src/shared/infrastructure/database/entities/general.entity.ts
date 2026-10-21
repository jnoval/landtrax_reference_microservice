import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseModel, LineModel } from '../models/general-model';

export class BaseEntity implements BaseModel {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id!: string;

  @Column({ name: 'CreatedBy', type: 'varchar', nullable: false })
  createdBy!: string;

  @CreateDateColumn({ name: 'CreatedDate', type: 'datetimeoffset', nullable: false })
  createdDate!: Date;

  @Column({ name: 'UpdatedBy', type: 'varchar', nullable: true })
  updatedBy?: string | null;

  @UpdateDateColumn({ name: 'UpdatedDate', type: 'datetimeoffset', nullable: true })
  updatedDate?: Date | null;

  @Column({ name: 'DeletedBy', type: 'varchar', nullable: true })
  deletedBy?: string | null;

  @DeleteDateColumn({ name: 'DeletedDate', type: 'datetimeoffset', nullable: true })
  deletedDate?: Date | null;
}

export class LineEntity implements LineModel {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id!: string;

  @CreateDateColumn({ name: 'CreatedDate', type: 'datetimeoffset', nullable: false })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'UpdatedDate', type: 'datetimeoffset', nullable: true })
  updatedDate?: Date | null;

  @DeleteDateColumn({ name: 'DeletedDate', type: 'datetimeoffset', nullable: true })
  deletedDate?: Date | null;
}
