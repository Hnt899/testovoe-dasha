import { IsString, Matches } from 'class-validator';

const TX_HASH_REGEX = /^0x?[0-9a-fA-F]{64}$/;

export class GetTxParamsDto {
  @IsString()
  @Matches(TX_HASH_REGEX)
  hash!: string;
}
