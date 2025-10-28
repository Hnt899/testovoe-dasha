import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBlockParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  height!: number;
}
