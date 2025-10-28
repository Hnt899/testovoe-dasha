import {
  ArgumentMetadata,
  BadRequestException,
  Controller,
  Get,
  Param,
  PipeTransform,
} from '@nestjs/common';
import { EvmService } from './evm.service';
import { GetBlockParamsDto } from './dto/get-block-params.dto';
import { GetTxParamsDto } from './dto/get-tx-params.dto';
import { EvmBlock } from './types/evm-block';
import { EvmTransaction } from './types/evm-tx';

class EvmBlockHeightPipe implements PipeTransform<string, number> {
  transform(value: string, _metadata: ArgumentMetadata): number {
    const rawValue = value?.toString().trim();
    if (!rawValue) throw new BadRequestException('Invalid block height');

    let height: number;
    if (rawValue.startsWith('0x') || rawValue.startsWith('0X')) {
      if (!/^0x[0-9a-fA-F]+$/.test(rawValue))
        throw new BadRequestException('Invalid block height');
      height = Number.parseInt(rawValue, 16);
    } else {
      if (!/^\d+$/.test(rawValue))
        throw new BadRequestException('Invalid block height');
      height = Number.parseInt(rawValue, 10);
    }

    if (!Number.isFinite(height) || Number.isNaN(height) || height < 0)
      throw new BadRequestException('Invalid block height');

    return height;
  }
}

@Controller('evm')
export class EvmController {
  constructor(private readonly evmService: EvmService) {}

  @Get('block/:height')
  getBlockByHeight(
    @Param() _params: GetBlockParamsDto,
    @Param('height', new EvmBlockHeightPipe()) height: number,
  ): Promise<EvmBlock> {
    return this.evmService.getBlockByHeight(height);
  }

  @Get('transactions/:hash')
  getTransactionByHash(
    @Param() params: GetTxParamsDto,
  ): Promise<EvmTransaction> {
    return this.evmService.getTransactionByHash(params.hash);
  }

  @Get('block/latest')
  getLatestBlock(): Promise<EvmBlock> {
    return this.evmService.getBlockByTag('latest');
  }
}