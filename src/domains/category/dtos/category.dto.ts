import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category', example: 'Land Registration' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Color Hex Code', example: '#3B82F6' })
  @IsNotEmpty()
  @IsString()
  colorHex!: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
