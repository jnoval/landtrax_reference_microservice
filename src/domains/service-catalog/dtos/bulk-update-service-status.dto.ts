import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class BulkUpdateServiceStatusDto {
  @ApiProperty({
    description: 'Array of Service Catalog IDs to update',
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsString({ each: true })
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
