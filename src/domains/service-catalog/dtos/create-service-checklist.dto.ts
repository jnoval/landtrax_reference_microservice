import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateServiceChecklistDto {
  @ApiProperty({ description: 'Service ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ description: 'Requirement ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  requirementId!: string;

  @ApiProperty({ description: 'Is Required', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isRequired!: boolean;

  @ApiProperty({ description: 'Sort Order', example: 1 })
  @IsOptional()
  @IsNumber()
  sort!: number | null;
}

export class UpdateServiceChecklistDto {
  @ApiProperty({ description: 'Is Required', example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: 'Sort Order', example: 1 })
  @IsOptional()
  @IsNumber()
  sort?: number | null;

  @ApiProperty({ description: 'Is Active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderItemDto {
  @ApiProperty({ description: 'Item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'New sort order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  sort!: number;
}
