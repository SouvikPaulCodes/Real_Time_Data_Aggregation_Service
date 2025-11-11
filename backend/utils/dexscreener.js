const retryWithBackoff = require("./retry")
const {rateLimiter} = require("../config/rateLimit")
const apiClient = require("./api")

async function fetchDexScreener() {
  await rateLimiter.wait();
  
  return retryWithBackoff(async () => {
    const response = await apiClient.get(
      'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112'
    );
    
    if (!response.data || !response.data.pairs) {
      return [];
    }

    return response.data.pairs
      .filter(pair => pair.chainId === 'solana')
      .slice(0, 50)
      .map(pair => ({
        token_address: pair.baseToken.address,
        token_name: pair.baseToken.name,
        token_ticker: pair.baseToken.symbol,
        price_sol: parseFloat(pair.priceNative) || 0,
        market_cap_sol: pair.fdv ? parseFloat(pair.fdv) / 150 : 0,
        volume_sol: pair.volume?.h24 ? parseFloat(pair.volume.h24) / 150 : 0,
        liquidity_sol: pair.liquidity?.usd ? parseFloat(pair.liquidity.usd) / 150 : 0,
        transaction_count: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        price_1hr_change: parseFloat(pair.priceChange?.h1) || 0,
        protocol: pair.dexId || 'Unknown'
      }));
  });
}

module.exports = fetchDexScreener