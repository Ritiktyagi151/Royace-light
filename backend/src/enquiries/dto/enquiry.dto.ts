import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EnquiryStatus } from '../schemas/enquiry.schema';

export class CreateEnquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(180)
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  subject: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  product?: string;
}

export class UpdateEnquiryStatusDto {
  @IsIn(Object.values(EnquiryStatus))
  status: EnquiryStatus;
}
