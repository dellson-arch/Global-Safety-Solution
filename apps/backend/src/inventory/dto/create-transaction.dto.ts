import { IsString, IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  item_id: string;

  @IsString()
  transaction_type: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
