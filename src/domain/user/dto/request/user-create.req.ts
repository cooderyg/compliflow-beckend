import { IsNotEmpty, IsString } from 'class-validator';

export class UserCreateReq {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
