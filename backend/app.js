const path = require("path")
const dotenv = require("dotenv");
dotenv.config({path: "../.env"});

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/ws/tokens/info' });


module.exports = {wss};

const cors = require('cors');
const cron = require('node-cron');
const redis = require("./config/redis");
const CONFIG = require("./config/config");
const aggregateTokenData = require("./utils/aggregate");
const {wsClients} = require("./config/broadcast");
const tokenRouter = require("./routes/tokenRouter");
const statRouter = require("./routes/statRouter");

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connectedClients: wsClients.size
  });
});

app.use('/api/tokens', tokenRouter);
app.use('/api/stats', statRouter);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));    
  })
}

app.options("*", cors());

cron.schedule(`*/${CONFIG.FETCH_INTERVAL} * * * * *`, () => {
  console.log('Scheduled fetch triggered');
  aggregateTokenData().catch(error => {
    console.error('Scheduled fetch failed:', error.message);
  });
});

aggregateTokenData().catch(error => {
  console.error('Initial fetch failed:', error.message);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  server.close(async () => {
    await redis.quit();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/tokens/info`);
});

module.exports = { app, server};