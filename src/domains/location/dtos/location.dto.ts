import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ description: 'Location name', example: 'Quezon City Register of Deeds' })
  @IsNotEmpty({ message: 'Location Name is required.' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Abbreviation or short code', example: 'QCRD' })
  @IsOptional()
  @IsString()
  abbreviation?: string | null;

  @ApiPropertyOptional({ description: 'Address of the location office' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({ description: 'Active status', example: true })
  @IsNotEmpty({ message: 'Status is required.' })
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
