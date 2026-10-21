import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BulkDeleteServiceDto {
  @ApiProperty({
    description: 'Array of Service Catalog IDs to delete',
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids!: string[];
}
