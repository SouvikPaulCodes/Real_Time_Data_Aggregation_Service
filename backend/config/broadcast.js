const {wss} = require("../app")

const wsClients = new Set();

wss.on('connection', async (ws) => {
  console.log('New WebSocket client connected');
  wsClients.add(ws);

  try {
    const cached = await redis.get('tokens:latest');
    if (cached) {
      ws.send(cached);
    } else {
      ws.send(JSON.stringify({ message: 'Cache empty, fetching data...' }));
      aggregateTokenData().catch(console.error);
    }
  } catch (error) {
    console.error('Error sending cached data:', error);
  }

  ws.on('close', () => {
    console.log('WebSocket cleint disconnected');
    wsClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    wsClients.delete(ws);
  });
});

function broadcastToClients(data) {
  const message = JSON.stringify(data);
  let cnt = 0;

  wsClients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
      cnt++;
    }
  });

  console.log(`Broadcasted to ${cnt} clients`);
}

module.exports = {broadcastToClients, wsClients}