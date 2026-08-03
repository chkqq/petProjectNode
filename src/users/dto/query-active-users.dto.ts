import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class QueryActiveUsersDto {
  @ApiProperty({ example: 18, minimum: 0, maximum: 150 })
  @IsInt()
  @Min(0)
  @Max(150)
  minAge: number;

  @ApiProperty({ example: 35, minimum: 0, maximum: 150 })
  @IsInt()
  @Min(0)
  @Max(150)
  maxAge: number;
}
