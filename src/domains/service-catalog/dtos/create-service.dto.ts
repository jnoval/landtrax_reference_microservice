import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'Category ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'Service Code', example: 'SVC-001' })
  @IsNotEmpty()
  @IsString()
  serviceCode!: string;

  @ApiProperty({ description: 'Name of the service', example: 'Land Title Transfer' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Type of the service', example: 'Land Title Transfer' })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    description: 'Description of the service',
    example: 'Transfer of land title ownership',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ description: 'Turnaround Days', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  turnaroundDays!: number;

  @ApiProperty({ description: 'Price of the service', example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  price!: number;
}
