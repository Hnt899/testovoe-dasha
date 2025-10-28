# SEI Integration Test Task

## Requirements
- Node.js 20+
- npm 9+
- Docker & Docker Compose (optional)

Copy `.env.example` to `.env` and adjust values if necessary.

```
EVM_RPC_URL=https://sei-evm-rpc.publicnode.com
COSMOS_RPC_URL=https://sei-m.rpc.n0ok.net:443
PORT=3000
```

## Installation
```
npm install
```

## Running locally
```
npm run dev
```
This command uses `nest start --watch`, which spawns the NestJS application with live reload.

To run in production mode:
```
npm run build
npm start
```

## Docker
```
docker-compose up --build
```
The API will be available at `http://localhost:3000`.

## Endpoints

### GET /evm/block/:height
Fetches EVM block information via a single `eth_getBlockByNumber` JSON-RPC request with `fullTransactions=false`.
```
curl http://localhost:3000/evm/block/123
```

### GET /evm/transactions/:hash
Fetches an EVM transaction via `eth_getTransactionByHash`.
```
curl http://localhost:3000/evm/transactions/0xHASH
```

### GET /cosmos/block/:height
Fetches a Cosmos block via Tendermint RPC `/block` endpoint.
```
curl http://localhost:3000/cosmos/block/123
```

### GET /cosmos/transactions/:hash
Fetches a Cosmos transaction using Tendermint `/tx` with fallback to `cosmos/tx/v1beta1/txs/{hash}`.
```
curl http://localhost:3000/cosmos/transactions/0xHASH
```

## Testing
```
npm test
```
End-to-end tests rely on mocked HTTP calls (`nock`) for the EVM routes.

## Implementation Notes
- `/evm/block/:height` performs exactly one JSON-RPC request (no additional block lookups).
- Cosmos fee parsing combines all fee entries into a comma-separated string of `amount+denom`.
- Sender parsing prefers the first signer public key and falls back to addresses within the first message.
