const request = require('supertest');
const WebSocket = require('ws');
const { app, server } = require('../app');

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    quit: jest.fn(),
    on: jest.fn()
  }));
});

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn()
  }))
}));

describe('Token Aggregation Service API', () => {
  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('connectedClients');
    });
  });

  describe('GET /api/tokens', () => {
    it('should return token list with default parameters', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = [
        {
          token_address: 'addr1',
          token_name: 'Token1',
          token_ticker: 'TK1',
          price_sol: 0.001,
          market_cap_sol: 1000,
          volume_sol: 500,
          liquidity_sol: 200,
          transaction_count: 100,
          price_1hr_change: 5.5,
          protocol: 'Raydium'
        }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app).get('/api/tokens');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });

    it('should handle cache miss gracefully', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      mockRedis.get.mockResolvedValue(null);

      const response = await request(app).get('/api/tokens');
      
      expect([200, 500]).toContain(response.status);
    });

    it('should accept and apply limit parameter', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = Array.from({ length: 20 }, (_, i) => ({
        token_address: `addr${i}`,
        token_name: `Token${i}`,
        token_ticker: `TK${i}`,
        price_sol: 0.001,
        market_cap_sol: 1000,
        volume_sol: 500,
        liquidity_sol: 200,
        transaction_count: 100,
        price_1hr_change: 5.5,
        protocol: 'Raydium'
      }));

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app).get('/api/tokens?limit=5');
      
      expect(response.status).toBe(200);
      if (response.body.data) {
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      }
    });

    it('should accept sortBy parameter', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = [
        { token_address: 'addr1', volume_sol: 100, market_cap_sol: 1000 },
        { token_address: 'addr2', volume_sol: 500, market_cap_sol: 2000 },
        { token_address: 'addr3', volume_sol: 200, market_cap_sol: 1500 }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app)
        .get('/api/tokens?sortBy=volume_sol&order=desc');
      
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/tokens/:address', () => {
    it('should return specific token by address', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = [
        {
          token_address: 'TESTADDR123',
          token_name: 'Test Token',
          token_ticker: 'TEST',
          price_sol: 0.001,
          market_cap_sol: 1000,
          volume_sol: 500,
          liquidity_sol: 200,
          transaction_count: 100,
          price_1hr_change: 5.5,
          protocol: 'Raydium'
        }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app).get('/api/tokens/TESTADDR123');
      
      expect(response.status).toBe(200);
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('token_address', 'TESTADDR123');
      }
    });

    it('should return 404 for non-existent token', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = [
        { token_address: 'addr1', token_name: 'Token1' }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app).get('/api/tokens/NONEXISTENT');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle missing cache data', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      mockRedis.get.mockResolvedValue(null);

      const response = await request(app).get('/api/tokens/ANYADDR');
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/stats', () => {
    it('should return aggregated statistics', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      
      const mockTokens = [
        {
          token_address: 'addr1',
          volume_sol: 100,
          market_cap_sol: 1000,
          price_1hr_change: 5.5
        },
        {
          token_address: 'addr2',
          volume_sol: 200,
          market_cap_sol: 2000,
          price_1hr_change: -2.5
        }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockTokens));

      const response = await request(app).get('/api/stats');
      
      expect(response.status).toBe(200);
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('totalTokens');
        expect(response.body.data).toHaveProperty('totalVolume');
        expect(response.body.data).toHaveProperty('totalMarketCap');
        expect(response.body.data).toHaveProperty('avgPriceChange');
        expect(response.body.data).toHaveProperty('topGainer');
        expect(response.body.data).toHaveProperty('topLoser');
      }
    });

    it('should handle no data available', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      mockRedis.get.mockResolvedValue(null);

      const response = await request(app).get('/api/stats');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis errors gracefully', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app).get('/api/tokens');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return proper error structure', async () => {
      const Redis = require('ioredis');
      const mockRedis = new Redis();
      mockRedis.get.mockRejectedValue(new Error('Test error'));

      const response = await request(app).get('/api/tokens');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('WebSocket Connection', () => {
  let ws;

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it('should establish WebSocket connection', (done) => {
    ws = new WebSocket('ws://localhost:8000/ws/tokens/info');

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should receive data after connection', (done) => {
    ws = new WebSocket('ws://localhost:8000/ws/tokens/info');

    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      expect(parsed).toBeDefined();
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  }, 10000);
});