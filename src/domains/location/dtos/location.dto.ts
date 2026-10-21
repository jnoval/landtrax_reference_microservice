import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRegistryOfDeedDto {
  @ApiProperty({ description: 'Registry of Deed name', example: 'Quezon City Register of Deeds' })
  @IsNotEmpty({ message: 'Registry of Deeds Name is required.' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Abbreviation or short code', example: 'QCRD' })
  @IsOptional()
  @IsString()
  abbreviation?: string | null;

  @ApiPropertyOptional({ description: 'Address of the Registry of Deeds office' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({ description: 'Active status', example: true })
  @IsNotEmpty({ message: 'Status is required.' })
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateRegistryOfDeedDto extends PartialType(CreateRegistryOfDeedDto) {}
