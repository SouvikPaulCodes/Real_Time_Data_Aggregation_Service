{
  "info": {
    "name": "Token Aggregation Service",
    "description": "Real-time token data aggregation API with WebSocket support",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://solana-aggregation-service.onrender.com",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        },
        "description": "Check if the service is running and get connection stats"
      },
      "response": []
    },
    {
      "name": "Get All Tokens",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"]
        },
        "description": "Fetch all tokens with default parameters"
      },
      "response": []
    },
    {
      "name": "Get Tokens with Limit",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "limit",
              "value": "10"
            }
          ]
        },
        "description": "Fetch limited number of tokens"
      },
      "response": []
    },
    {
      "name": "Get Tokens Sorted by Volume",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?sortBy=volume_sol&order=desc&limit=20",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "sortBy",
              "value": "volume_sol"
            },
            {
              "key": "order",
              "value": "desc"
            },
            {
              "key": "limit",
              "value": "20"
            }
          ]
        },
        "description": "Get tokens sorted by trading volume"
      },
      "response": []
    },
    {
      "name": "Get Tokens Sorted by Price Change",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?sortBy=price_1hr_change&order=desc&limit=15",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "sortBy",
              "value": "price_1hr_change"
            },
            {
              "key": "order",
              "value": "desc"
            },
            {
              "key": "limit",
              "value": "15"
            }
          ]
        },
        "description": "Get top gainers by 1hr price change"
      },
      "response": []
    },
    {
      "name": "Get Tokens Sorted by Market Cap",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?sortBy=market_cap_sol&order=desc",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "sortBy",
              "value": "market_cap_sol"
            },
            {
              "key": "order",
              "value": "desc"
            }
          ]
        },
        "description": "Get tokens sorted by market cap"
      },
      "response": []
    },
    {
      "name": "Get Token by Address",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens/So11111111111111111111111111111111111111112",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens", "So11111111111111111111111111111111111111112"]
        },
        "description": "Fetch specific token by its address (example: SOL address)"
      },
      "response": []
    },
    {
      "name": "Get Statistics",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/stats",
          "host": ["{{baseUrl}}"],
          "path": ["api", "stats"]
        },
        "description": "Get aggregated statistics including total volume, market cap, top gainer/loser"
      },
      "response": []
    },
    {
      "name": "Rapid Fire Test - Call 1",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?limit=5",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "limit",
              "value": "5"
            }
          ]
        },
        "description": "Part of rapid fire testing sequence"
      },
      "response": []
    },
    {
      "name": "Rapid Fire Test - Call 2",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "limit",
              "value": "10"
            }
          ]
        },
        "description": "Part of rapid fire testing sequence"
      },
      "response": []
    },
    {
      "name": "Rapid Fire Test - Call 3",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/stats",
          "host": ["{{baseUrl}}"],
          "path": ["api", "stats"]
        },
        "description": "Part of rapid fire testing sequence"
      },
      "response": []
    },
    {
      "name": "Rapid Fire Test - Call 4",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        },
        "description": "Part of rapid fire testing sequence"
      },
      "response": []
    },
    {
      "name": "Rapid Fire Test - Call 5",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/tokens?sortBy=volume_sol",
          "host": ["{{baseUrl}}"],
          "path": ["api", "tokens"],
          "query": [
            {
              "key": "sortBy",
              "value": "volume_sol"
            }
          ]
        },
        "description": "Part of rapid fire testing sequence"
      },
      "response": []
    }
  ]
}