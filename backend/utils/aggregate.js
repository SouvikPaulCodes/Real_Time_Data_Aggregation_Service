const fetchDexScreener = require("./dexscreener");
const fetchGeckoTerminal = require("./gecko")
const mergeTokens = require("./merge")
const CONFIG = require("../config/config")
const redis = require("../config/redis")
const {broadcastToClients} = require("../config/broadcast")

async function aggregateTokenData() {
  try {
    console.log('Fetching token data from APIs...');
    
    const [dexScreenerData, geckoData] = await Promise.allSettled([
      fetchDexScreener(),
      fetchGeckoTerminal()
    ]);

    const sources = [];
    
    if (dexScreenerData.status === 'fulfilled') {
      console.log(`DexScreener: ${dexScreenerData.value.length} tokens`);
      sources.push(dexScreenerData.value);
    } else {
      console.error('DexScreener failed:', dexScreenerData.reason.message);
    }

    if (geckoData.status === 'fulfilled') {
      console.log(`GeckoTerminal: ${geckoData.value.length} tokens`);
      sources.push(geckoData.value);
    } else {
      console.error('GeckoTerminal failed:', geckoData.reason.message);
    }

    if (sources.length === 0) {
      throw new Error('All API sources failed');
    }

    const mergedTokens = mergeTokens(sources);
    console.log(`Merged result: ${mergedTokens.length} unique tokens`);

    // Cache the data
    await redis.setex(
      'tokens:latest',
      CONFIG.CACHE_TTL,
      JSON.stringify(mergedTokens)
    );

    // Broadcast to all connected WebSocket clients
    broadcastToClients(mergedTokens);

    return mergedTokens;
  } catch (error) {
    console.error('Error aggregating token data:', error.message);
    throw error;
  }
}

module.exports = aggregateTokenData