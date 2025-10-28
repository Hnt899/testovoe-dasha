import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { EvmBlock } from './types/evm-block';
import { EvmTransaction } from './types/evm-tx';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result: T | null;
  error?: { code: number; message: string };
}

@Injectable()
export class EvmService {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('EVM_RPC_URL');
    if (!baseURL) {
      throw new Error('EVM_RPC_URL is not configured');
    }

    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
  }

  async getBlockByHeight(height: number): Promise<EvmBlock> {
    const hexHeight = `0x${height.toString(16)}`;

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'eth_getBlockByNumber',
      params: [hexHeight, false],
    };

    try {
      const { data } = await this.client.post<JsonRpcResponse<any>>('', request);

      if (data.error || !data.result) {
        throw new NotFoundException(`Block ${height} not found`);
      }

      const block = data.result;

      return {
        height,
        hash: block.hash,
        parentHash: block.parentHash,
        gasLimit: this.hexToDecimalString(block.gasLimit)!,
        gasUsed: this.hexToDecimalString(block.gasUsed)!,
        size: this.hexToDecimalString(block.size)!,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (isAxiosError(error) && error.response?.data?.error) {
        throw new NotFoundException(`Block ${height} not found`);
      }
      throw new ServiceUnavailableException('Failed to fetch block from EVM node');
    }
  }

  async getTransactionByHash(hash: string): Promise<EvmTransaction> {
    const normalizedHash = this.normalizeHash(hash);

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'eth_getTransactionByHash',
      params: [normalizedHash],
    };

    try {
      const { data } = await this.client.post<JsonRpcResponse<any>>('', request);

      if (data.error || !data.result) {
        throw new NotFoundException(`Transaction ${normalizedHash} not found`);
      }

      const tx = data.result;

      return {
        hash: tx.hash,
        to: tx.to ?? null,
        from: tx.from,
        value: this.hexToDecimalString(tx.value)!,
        input: tx.input,
        maxFeePerGas: this.hexToDecimalString(tx.maxFeePerGas),
        maxPriotityFeePerGas: this.hexToDecimalString(tx.maxPriorityFeePerGas),
        gasPrice: this.hexToDecimalString(tx.gasPrice),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (isAxiosError(error) && error.response?.data?.error) {
        throw new NotFoundException(`Transaction ${normalizedHash} not found`);
      }
      throw new ServiceUnavailableException('Failed to fetch transaction from EVM node');
    }
  }

  private hexToDecimalString(hexValue?: string | null): string | null {
    if (!hexValue) {
      return null;
    }

    const normalized = hexValue.toLowerCase().startsWith('0x') ? hexValue.slice(2) : hexValue;
    if (normalized.length === 0) {
      return '0';
    }
    return BigInt(`0x${normalized}`).toString(10);
  }

  private normalizeHash(hash: string): string {
    return hash.startsWith('0x') ? hash : `0x${hash}`;
  }

  async getBlockByTag(tag: 'latest'): Promise<EvmBlock> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: [tag, false],
    };

    try {
      const { data } = await this.client.post<JsonRpcResponse<any>>('', request);

      if (data.error || !data.result) {
        throw new NotFoundException(`Block ${tag} not found`);
      }

      const block = data.result;
      const blockNumber: string | undefined = block?.number;
      const height =
        typeof blockNumber === 'string'
          ? Number.parseInt(blockNumber, 16)
          : Number.NaN;

      if (!Number.isFinite(height) || Number.isNaN(height) || height < 0) {
        throw new NotFoundException(`Block ${tag} not found`);
      }

      return {
        height,
        hash: block.hash,
        parentHash: block.parentHash,
        gasLimit: this.hexToDecimalString(block.gasLimit)!,
        gasUsed: this.hexToDecimalString(block.gasUsed)!,
        size: this.hexToDecimalString(block.size)!,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (isAxiosError(error) && error.response?.data?.error) {
        throw new NotFoundException(`Block ${tag} not found`);
      }
      throw new ServiceUnavailableException('Failed to fetch block from EVM node');
    }
  }
}
