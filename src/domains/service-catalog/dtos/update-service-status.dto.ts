import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateServiceStatusDto {
  @ApiProperty({ description: 'Service active status', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}
