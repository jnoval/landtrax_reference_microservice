import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRequirementMappingDto {
  @ApiProperty({
    description: 'Source Requirement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  sourceRequirementId!: string;

  @ApiProperty({
    description: 'Target Requirement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  targetRequirementId!: string;

  @ApiPropertyOptional({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string | null;

  @ApiProperty({ description: 'Source Field Name', example: 'invoice_number' })
  @IsNotEmpty()
  @IsString()
  sourceFieldName!: string;

  @ApiProperty({ description: 'Target Field Name', example: 'invoiceNo' })
  @IsNotEmpty()
  @IsString()
  targetFieldName!: string;

  @ApiPropertyOptional({ description: 'Priority of the mapping (defaults to 1)', example: 1 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateRequirementMappingDto {
  @ApiPropertyOptional({ description: 'Source Field Name', example: 'invoice_number' })
  @IsOptional()
  @IsString()
  sourceFieldName?: string;

  @ApiPropertyOptional({ description: 'Target Field Name', example: 'invoiceNo' })
  @IsOptional()
  @IsString()
  targetFieldName?: string;

  @ApiPropertyOptional({ description: 'Priority of the mapping', example: 1 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
