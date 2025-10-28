export interface CosmosTransaction {
  hash: string;
  height: number;
  time: string;
  gasUsed: string;
  gasWanted: string;
  fee: string | null;
  sender: string | null;
}
