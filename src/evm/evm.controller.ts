import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EvmService } from './evm.service';
import { GetBlockParamsDto } from './dto/get-block-params.dto';
import { GetTxParamsDto } from './dto/get-tx-params.dto';
import { EvmBlock } from './types/evm-block';
import { EvmTransaction } from './types/evm-tx';

@Controller('evm')
export class EvmController {
  constructor(private readonly evmService: EvmService) {}

  @Get('block/:height')
  getBlockByHeight(
    @Param() _params: GetBlockParamsDto,
    @Param('height', ParseIntPipe) height: number,
  ): Promise<EvmBlock> {
    return this.evmService.getBlockByHeight(height);
  }

  @Get('transactions/:hash')
  getTransactionByHash(
    @Param() params: GetTxParamsDto,
  ): Promise<EvmTransaction> {
    return this.evmService.getTransactionByHash(params.hash);
  }
}
