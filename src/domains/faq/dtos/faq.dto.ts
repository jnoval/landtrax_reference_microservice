import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFAQDto {
  @ApiProperty({
    description: 'FAQ title/question',
    example: 'How do I reset my password?',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'FAQ answer/content',
    example: 'To reset your password, go to the login page and click "Forgot Password".',
  })
  @IsOptional()
  @IsString()
  content?: string | null;
}

export class UpdateFAQDto extends PartialType(CreateFAQDto) {}

export class UpdateFAQStatusDto {
  @ApiProperty({ description: 'Active status indicator', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}

export class BulkUpdateFAQStatusDto {
  @ApiProperty({ description: 'Array of FAQ IDs to update', example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids!: string[];

  @ApiProperty({ description: 'Active status indicator', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}

export class BulkDeleteFAQDto {
  @ApiProperty({ description: 'Array of FAQ IDs to delete', example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids!: string[];
}
