import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import nock from 'nock';
import { AppModule } from '../src/app.module';

describe('EVM API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.EVM_RPC_URL = 'http://localhost:8545';
    process.env.COSMOS_RPC_URL = 'http://localhost:26657';
    nock.disableNetConnect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
    nock.enableNetConnect();
  });

  it('/evm/block/:height (GET) success', async () => {
    const blockHeight = 123;
    const hexHeight = '0x7b';

    nock(process.env.EVM_RPC_URL!)
      .post('/', {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [hexHeight, false],
      })
      .reply(200, {
        jsonrpc: '2.0',
        id: 1,
        result: {
          hash: '0xhash',
          parentHash: '0xparent',
          gasLimit: '0x5208',
          gasUsed: '0x5208',
          size: '0x1',
        },
      });

    const response = await request(app.getHttpServer()).get(`/evm/block/${blockHeight}`).expect(200);

    expect(response.body).toEqual({
      height: blockHeight,
      hash: '0xhash',
      parentHash: '0xparent',
      gasLimit: '21000',
      gasUsed: '21000',
      size: '1',
    });
  });

  it('/evm/block/:height (GET) not found', async () => {
    const blockHeight = 99999;
    const hexHeight = `0x${blockHeight.toString(16)}`;

    nock(process.env.EVM_RPC_URL!)
      .post('/', {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [hexHeight, false],
      })
      .reply(200, {
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });

    await request(app.getHttpServer()).get(`/evm/block/${blockHeight}`).expect(404);
  });

  it('/evm/transactions/:hash (GET) success', async () => {
    const txHash = '0xabc';

    nock(process.env.EVM_RPC_URL!)
      .post('/', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
      })
      .reply(200, {
        jsonrpc: '2.0',
        id: 1,
        result: {
          hash: txHash,
          to: '0xdef',
          from: '0x123',
          value: '0x1',
          input: '0x',
          maxFeePerGas: '0x2',
          maxPriorityFeePerGas: '0x3',
          gasPrice: '0x4',
        },
      });

    const response = await request(app.getHttpServer())
      .get(`/evm/transactions/${txHash}`)
      .expect(200);

    expect(response.body).toEqual({
      hash: txHash,
      to: '0xdef',
      from: '0x123',
      value: '1',
      input: '0x',
      maxFeePerGas: '2',
      maxPriotityFeePerGas: '3',
      gasPrice: '4',
    });
  });

  it('/evm/transactions/:hash (GET) not found', async () => {
    const txHash = '0x999';

    nock(process.env.EVM_RPC_URL!)
      .post('/', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
      })
      .reply(200, {
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });

    await request(app.getHttpServer()).get(`/evm/transactions/${txHash}`).expect(404);
  });
});
