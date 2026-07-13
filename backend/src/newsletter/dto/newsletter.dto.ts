import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateNewsletterPreferenceDto {
  @IsBoolean()
  isActive: boolean;
}
