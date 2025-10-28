import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CosmosBlock } from './types/cosmos-block';
import { CosmosTransaction } from './types/cosmos-tx';

@Injectable()
export class CosmosService {
  private readonly rpcClient: AxiosInstance;
  private readonly restClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('COSMOS_RPC_URL');
    if (!baseURL) {
      throw new Error('COSMOS_RPC_URL is not configured');
    }

    this.rpcClient = axios.create({
      baseURL,
      timeout: 15000,
    });

    this.restClient = axios.create({
      baseURL,
      timeout: 15000,
    });
  }

  async getBlockByHeight(height: number): Promise<CosmosBlock> {
    try {
      const { data } = await this.rpcClient.get('/block', {
        params: { height },
      });

      const result = data?.result;
      const block = result?.block;
      if (!block?.header || !result?.block_id) {
        throw new NotFoundException(`Block ${height} not found`);
      }

      return {
        height: Number(block.header.height),
        time: String(block.header.time),
        hash: String(result.block_id.hash),
        proposedAddress: String(block.header.proposer_address),
      };
    } catch (error) {
      throw new NotFoundException(`Block ${height} not found`);
    }
  }

  async getTransactionByHash(hash: string): Promise<CosmosTransaction> {
    const normalizedHash = this.normalizeHash(hash);

    const tendermintTx = await this.fetchTendermintTx(normalizedHash);
    if (tendermintTx) {
      return tendermintTx;
    }

    const restTx = await this.fetchRestTx(normalizedHash);
    if (restTx) {
      return restTx;
    }

    throw new NotFoundException(`Transaction ${normalizedHash} not found`);
  }

  private async fetchTendermintTx(hash: string): Promise<CosmosTransaction | null> {
    try {
      const { data } = await this.rpcClient.get('/tx', {
        params: { hash },
      });

      const result = data?.result;
      if (!result) {
        return null;
      }

      return {
        hash: String(result.hash ?? hash),
        height: Number(result.height ?? 0),
        time: String(result.tx_result?.timestamp ?? result.timestamp ?? ''),
        gasUsed: String(result.tx_result?.gas_used ?? ''),
        gasWanted: String(result.tx_result?.gas_wanted ?? ''),
        fee: null,
        sender: null,
      };
    } catch (error) {
      return null;
    }
  }

  private async fetchRestTx(hash: string): Promise<CosmosTransaction | null> {
    try {
      const cleanHash = hash.replace(/^0x/, '');
      const { data } = await this.restClient.get(`/cosmos/tx/v1beta1/txs/${cleanHash}`);
      const response = data?.tx_response;
      if (!response) {
        return null;
      }

      const tx = response.tx;
      const fee = this.extractFee(tx);
      const sender = this.extractSender(tx) ?? this.extractSenderFromMessages(tx);

      return {
        hash: String(response.txhash ?? hash),
        height: Number(response.height ?? 0),
        time: String(response.timestamp ?? ''),
        gasUsed: String(response.gas_used ?? ''),
        gasWanted: String(response.gas_wanted ?? ''),
        fee,
        sender,
      };
    } catch (error) {
      return null;
    }
  }

  private extractFee(tx: any): string | null {
    const amounts: Array<{ amount?: string; denom?: string }> =
      tx?.auth_info?.fee?.amount;
    if (!Array.isArray(amounts) || amounts.length === 0) {
      return null;
    }

    const parts = amounts
      .map((item) => (item?.amount && item?.denom ? `${item.amount}${item.denom}` : null))
      .filter((item): item is string => Boolean(item));

    return parts.length > 0 ? parts.join(', ') : null;
  }

  private extractSender(tx: any): string | null {
    const signerInfos: any[] = tx?.auth_info?.signer_infos;
    if (Array.isArray(signerInfos) && signerInfos.length > 0) {
      const signer = signerInfos[0];
      const publicKey = signer?.public_key;
      if (typeof publicKey === 'string') {
        return publicKey;
      }
      if (publicKey?.key) {
        return publicKey.key;
      }
      if (publicKey?.address) {
        return publicKey.address;
      }
    }
    return null;
  }

  private extractSenderFromMessages(tx: any): string | null {
    const messages: any[] = tx?.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    for (const message of messages) {
      if (typeof message !== 'object' || message === null) {
        continue;
      }
      if (message.from_address) {
        return message.from_address;
      }
      if (message.sender) {
        return message.sender;
      }
      if (message.delegator_address) {
        return message.delegator_address;
      }
    }

    return null;
  }

  private normalizeHash(hash: string): string {
    return hash.startsWith('0x') ? hash : `0x${hash}`;
  }

  async getLatestBlock(): Promise<CosmosBlock> {
    try {
      const { data } = await this.rpcClient.get('/block');

      const result = data?.result;
      const block = result?.block;
      const header = block?.header;
      const blockId = result?.block_id;

      const height = Number(header?.height);

      if (
        !header ||
        !blockId?.hash ||
        Number.isNaN(height) ||
        !Number.isFinite(height) ||
        height < 0
      ) {
        throw new NotFoundException('Latest block not found');
      }

      return {
        height,
        time: String(header.time),
        hash: String(blockId.hash),
        proposedAddress: String(header.proposer_address),
      };
    } catch (error) {
      throw new NotFoundException('Latest block not found');
    }
  }
}
