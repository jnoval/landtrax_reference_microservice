import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { RequirementType } from '../../../shared/infrastructure/database/entities/requirement.entity';

const PLACEHOLDER_ALLOWED_CHARS = /^[A-Za-z0-9 !@#$%^&*()\-_=+[\]{}|\\;:'",<.>/?~]*$/;
const isDocument = (o: { type?: RequirementType }) => o.type === 'DOCUMENT';

export class CreateRequirementDto {
  @ApiPropertyOptional({
    description: 'Requirement Code',
    example: 'REQ-001',
  })
  @IsOptional()
  @IsString()
  requirementCode?: string;

  @ApiProperty({ description: 'Name of the requirement', example: 'Business Permit' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Requirement name is required' })
  @IsString()
  @MinLength(1, { message: 'Requirement name is required' })
  @MaxLength(255, { message: 'Requirement name cannot exceed 255 characters.' })
  name!: string;

  @ApiPropertyOptional({ description: 'Description of the requirement' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'allows upload of the requirement' })
  @IsOptional()
  @IsBoolean()
  allowsUpload?: boolean;

  @ApiPropertyOptional({ description: 'accepted file types of the requirement' })
  @ValidateIf(isDocument)
  @IsNotEmpty({ message: 'Select at least one accepted file type.' })
  @IsString()
  acceptedFileTypes?: string | null;

  @ApiPropertyOptional({ description: 'accepted government IDs for the requirement' })
  @IsOptional()
  @IsString()
  acceptedGovernmentIds?: string | null;

  @ApiPropertyOptional({
    description: 'max file size of the requirement in MB',
  })
  @ValidateIf(isDocument)
  @IsDefined({ message: 'Max file size is required' })
  @IsNumber()
  @Max(100, { message: 'Max file size cannot exceed 100 MB.' })
  maxFileSize?: number | null;

  @ApiPropertyOptional({ description: 'minimum number of files required' })
  @ValidateIf(isDocument)
  @IsDefined({ message: 'Min files is required' })
  @IsNumber()
  minFiles?: number | null;

  @ApiPropertyOptional({ description: 'number of max files of the requirement' })
  @ValidateIf(isDocument)
  @IsDefined({ message: 'Max files is required' })
  @IsNumber()
  maxFiles?: number | null;

  @ApiPropertyOptional({
    description: 'File naming format convention for uploaded documents',
    example: '{applicant_name}_{document_type}_{date}',
  })
  @ValidateIf(isDocument)
  @IsNotEmpty({ message: 'Document naming convention is required' })
  @IsString()
  @MaxLength(255, { message: 'Document naming convention cannot exceed 255 characters.' })
  fileNameFormat?: string | null;

  @ApiPropertyOptional({ description: 'Classification prompt of the requirement' })
  @ValidateIf(isDocument)
  @IsOptional()
  @IsString()
  classificationPrompt?: string | null;

  @ApiPropertyOptional({ description: 'Toggle to enable/disable OCR classification for this requirement' })
  @ValidateIf(isDocument)
  @IsOptional()
  @IsBoolean()
  isClassificationEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'whether the information field is optional for OCR validation',
  })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({
    description: 'placeholder text for information input field',
    example: 'Enter your contact number',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((o) => o.type === 'INFORMATION')
  @IsNotEmpty({ message: 'Placeholder is required.' })
  @MaxLength(100, { message: 'Placeholder text cannot exceed 100 characters.' })
  @Matches(PLACEHOLDER_ALLOWED_CHARS, {
    message: 'Placeholder text contains unsupported characters.',
  })
  placeholder?: string | null;

  @ApiProperty({ description: 'Type of the requirement', example: 'DOCUMENT' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['DOCUMENT', 'INFORMATION'])
  type!: RequirementType;
}

export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {}

export class UpdateRequirementStatusDto {
  @ApiProperty({ description: 'Requirement active status', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}

export class BulkUpdateRequirementStatusDto {
  @ApiProperty({
    description: 'Array of Requirement IDs to update',
    example: ['uuid1', 'uuid2'],
  })
  @IsNotEmpty({ each: true })
  ids!: string[];

  @ApiProperty({
    description: 'Active status indicator',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}

export class BulkDeleteRequirementDto {
  @ApiProperty({
    description: 'Array of Requirement IDs to delete',
    example: ['uuid1', 'uuid2'],
  })
  @IsNotEmpty({ each: true })
  ids!: string[];
}
