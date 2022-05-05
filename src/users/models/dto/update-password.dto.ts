import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({ required: true, minLength: 6 })
  newPassword: string;
}
