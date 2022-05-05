import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @ApiProperty({ required: true, minLength: 3 })
  username: string;
}
