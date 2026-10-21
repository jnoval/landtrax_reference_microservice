interface LogsModel {
  createdBy: string;
  createdDate: Date;
  updatedBy?: string | null;
  updatedDate?: Date | null;
  deletedBy?: string | null;
  deletedDate?: Date | null;
}

export interface LineModel {
  id: string;
  createdDate: Date;
  updatedDate?: Date | null;
  deletedDate?: Date | null;
}

export interface BaseModel extends LogsModel {
  id: string;
}

export enum ENTITY {
  BASE = 'Base',
  LOGS = 'Logs',
  LINE = 'Line',
  USER = 'User',
  USER_ROLE = 'UserRole',
  ROLE = 'Role',
  ROLE_ACCESSIBLE_LINK = 'RoleAccessibleLink',
  USER_COMPANY = 'UserCompany',
  COMPANY = 'Company',
  PROPOSAL_REFERENCE = 'ProposalReference',
  REQUIREMENT_MAPPING = 'RequirementMapping',
  REQUIREMENT = 'Requirement',
  SERVICE = 'Service',
  SERVICE_CHECKLIST = 'ServiceChecklist',
  STAGING_STATUS = 'StagingStatus',
  STAGING_STATUS_FINDING = 'StagingStatusFinding',
  STAGING = 'Staging',
  PAY_TYPE = 'PayType',
  FAQ = 'FAQ',
  CATEGORY = 'Category',
  TAG = 'Tag',
  DOCUMENT_TAG = 'DocumentTag',
  ADDRESS = 'Address',
  TRANSACTION_SERVICE = 'TransactionService',
  TRANSACTION = 'Transaction',
  AUDIT_TRAIL = 'AuditTrail',
  SYSTEM_SETTINGS = 'SystemSettings',
  REGISTRY_OF_DEED = 'RegistryOfDeed',
  LANDTRAX_ADDRESS = 'LandtraxAddress',
}
