const retryWithBackoff = require("./retry")
const {rateLimiter} = require("../config/rateLimit")
const apiClient = require("./api")

async function fetchGeckoTerminal() {
  await rateLimiter.wait();
  
  return retryWithBackoff(async () => {
    const response = await apiClient.get(
      'https://api.geckoterminal.com/api/v2/networks/solana/trending_pools'
    );
    
    if (!response.data || !response.data.data) {
      return [];
    }

    return response.data.data.slice(0, 50).map(pool => {
      const attrs = pool.attributes;
      return {
        token_address: attrs.base_token_address || attrs.address,
        token_name: attrs.name?.split('/')[0]?.trim() || 'Unknown',
        token_ticker: attrs.base_token_symbol || 'UNK',
        price_sol: parseFloat(attrs.base_token_price_native_currency) || 0,
        market_cap_sol: attrs.market_cap_usd ? parseFloat(attrs.market_cap_usd) / 150 : 0,
        volume_sol: attrs.volume_usd?.h24 ? parseFloat(attrs.volume_usd.h24) / 150 : 0,
        liquidity_sol: attrs.reserve_in_usd ? parseFloat(attrs.reserve_in_usd) / 150 : 0,
        transaction_count: (attrs.transactions?.h24?.buys || 0) + (attrs.transactions?.h24?.sells || 0),
        price_1hr_change: parseFloat(attrs.price_change_percentage?.h1) || 0,
        protocol: attrs.dex_id || 'GeckoTerminal'
      };
    });
  });
}

module.exports = fetchGeckoTerminal