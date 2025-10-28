export interface EvmTransaction {
  hash: string;
  to: string | null;
  from: string;
  value: string;
  input: string;
  maxFeePerGas: string | null;
  maxPriotityFeePerGas: string | null;
  gasPrice: string | null;
}
