import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ENTITY } from '../models/general-model';
import { BaseEntity } from './general.entity';
import { LocationEntity } from './location.entity';
import UserEntity from './user.entity';

@Entity(ENTITY.TRANSACTION)
export default class TransactionEntity extends BaseEntity {
  @Column({ name: 'UserId', type: 'varchar', nullable: true })
  userId!: string | null;

  @Column({ name: 'TransactionNumber', type: 'varchar', length: 255, nullable: true })
  transactionNumber!: string | null;

  @Column({ name: 'Type', type: 'varchar', length: 255, nullable: false })
  type!: string;

  @Column({ name: 'StagingId', type: 'varchar', nullable: false })
  stagingId!: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'EOSDocument', type: 'text', nullable: true })
  eosDocument!: string | null;

  @Column({ name: 'TAT', type: 'int', nullable: true })
  tat!: number;

  @Column({ name: 'CompletedAt', type: 'datetime2', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'DeliveryMethod', type: 'varchar', length: 255, nullable: true })
  deliveryMethod?: string | null;

  @Column({ name: 'TATStartDate', type: 'datetime2', nullable: true })
  tatStartDate!: Date | null;

  @Column({ name: 'TATEndDate', type: 'datetime2', nullable: true })
  tatEndDate!: Date | null;

  @Column({ name: 'DeliveryTrackingNumber', type: 'varchar', length: 255, nullable: true })
  deliveryTrackingNumber?: string | null;

  @Column({ name: 'ProposalReferenceNumber', type: 'varchar', length: 255, nullable: true })
  proposalReferenceNumber?: string | null;

  @Column({ name: 'PaidPercentage', type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidPercentage?: number | null;

  @Column({ name: 'PaymentCompleted', type: 'bit', nullable: true })
  paymentCompleted?: boolean | null;

  @Column({ name: 'PaymentStatus', type: 'varchar', nullable: true, default: 'Pending' })
  paymentStatus?: string | null;

  @Column({ name: 'EOSUploaded', type: 'bit', nullable: true })
  eosUploaded?: boolean | null;

  @Column({ name: 'EOSFileUrl', type: 'varchar', length: 500, nullable: true })
  eosFileUrl?: string | null;

  @Column({ name: 'EOSUploadedDate', type: 'datetime2', nullable: true })
  eosUploadedDate?: Date | null;

  @Column({ name: 'EOSUploadedBy', type: 'varchar', length: 255, nullable: true })
  eosUploadedBy?: string | null;

  @Column({ name: 'ApprovedDate', type: 'datetime', nullable: true })
  approvedDate?: Date | null;

  @Column({ name: 'ApprovedBy', type: 'varchar', length: 255, nullable: true })
  approvedBy?: string | null;

  @Column({ name: 'IsEOSApproved', type: 'bit', nullable: true })
  isEOSApproved?: boolean | null;

  @Column({ name: 'DeletionRequested', type: 'bit', nullable: true, default: false })
  deletionRequested?: boolean | null;

  @Column({ name: 'DeletionRequestedBy', type: 'varchar', length: 255, nullable: true })
  deletionRequestedBy?: string | null;

  @Column({ name: 'DeletionRequestedDate', type: 'datetime2', nullable: true })
  deletionRequestedDate?: Date | null;

  @Column({ name: 'DeletionApprovalToken', type: 'varchar', length: 500, nullable: true })
  deletionApprovalToken?: string | null;

  @Column({ name: 'DeletionNote', type: 'nvarchar', length: 2000, nullable: true })
  deletionNote?: string | null;

  @Column({ name: 'DeletionRejectionReason', type: 'nvarchar', length: 2000, nullable: true })
  deletionRejectionReason?: string | null;

  @Column({ name: 'InitialFee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  initialFee!: number | null;

  @Column({ name: 'AdditionalFees', type: 'decimal', precision: 10, scale: 2, nullable: true })
  additionalFees?: number | null;

  @Column({ name: 'DiscountAmount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number | null;

  @Column({ name: 'VATAmount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  vatAmount?: number | null;

  @Column({ name: 'TotalFee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalFee?: number | null;

  @Column({ name: 'DeliveryAddress', type: 'text', nullable: true })
  deliveryAddress?: string | null;

  @Column({ name: 'LandtraxAddressId', type: 'uniqueidentifier', nullable: true })
  landtraxAddressId?: string | null;

  @Column({ name: 'RegistryOfDeedId', type: 'varchar', nullable: true })
  registryOfDeedId!: string | null;

  @ManyToOne(() => UserEntity, {
    eager: false,
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'UserId', referencedColumnName: 'id' })
  user?: UserEntity;

  @ManyToOne(() => LocationEntity, {
    eager: false,
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'RegistryOfDeedId', referencedColumnName: 'id' })
  location?: LocationEntity;
}
