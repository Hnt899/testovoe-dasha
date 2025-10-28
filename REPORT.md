# Report

## Stack
- Node.js 20
- NestJS 10
- axios
- class-validator / class-transformer
- Jest + Supertest + nock
- Docker & Docker Compose

## What was done
- Implemented `/evm/block/:height` with a single `eth_getBlockByNumber` call (fullTransactions = false) and decimal conversions for gas metrics.
- Implemented `/evm/transactions/:hash` returning requested fields, mapping `maxPriorityFeePerGas` into `maxPriotityFeePerGas`.
- Implemented `/cosmos/block/:height` via Tendermint RPC `/block` endpoint.
- Implemented `/cosmos/transactions/:hash` with Tendermint `/tx` primary lookup and REST `cosmos/tx/v1beta1/txs/{hash}` fallback, parsing fee and sender safely.
- Added validation DTOs, global validation, timeout interceptor, and centralized HTTP exception filter.
- Added e2e tests for EVM routes with mocked RPC responses.
- Delivered Dockerfile, docker-compose, Postman collection, and SQL query for top-N blocks.

## How to run
```
npm install
npm run dev
```
Or with Docker:
```
docker-compose up --build
```

## Possible improvements
- Introduce caching of hot blocks/transactions to reduce RPC load.
- Add retry logic with circuit breaking for flaky RPC nodes.
- Expose metrics and structured logging for observability.
- Apply rate limiting and request tracing for production hardening.
