import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CosmosService } from './cosmos.service';
import { GetBlockParamsDto } from './dto/get-block-params.dto';
import { GetTxParamsDto } from './dto/get-tx-params.dto';
import { CosmosBlock } from './types/cosmos-block';
import { CosmosTransaction } from './types/cosmos-tx';

@Controller('cosmos')
export class CosmosController {
  constructor(private readonly cosmosService: CosmosService) {}

  @Get('block/:height')
  getBlockByHeight(
    @Param() _params: GetBlockParamsDto,
    @Param('height', ParseIntPipe) height: number,
  ): Promise<CosmosBlock> {
    return this.cosmosService.getBlockByHeight(height);
  }

  @Get('transactions/:hash')
  getTransactionByHash(
    @Param() params: GetTxParamsDto,
  ): Promise<CosmosTransaction> {
    return this.cosmosService.getTransactionByHash(params.hash);
  }

  @Get('block/latest')
  getLatestBlock(): Promise<CosmosBlock> {
    return this.cosmosService.getLatestBlock();
  }
}
