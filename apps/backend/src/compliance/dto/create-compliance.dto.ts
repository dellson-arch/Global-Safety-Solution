import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateComplianceDto {
  @IsUUID()
  client_id: string;

  @IsString()
  compliance_type: string;

  @IsOptional()
  @IsString()
  reference_number?: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  renewal_cycle_days?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
