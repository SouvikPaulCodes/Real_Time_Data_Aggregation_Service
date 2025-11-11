const redis = require("../config/redis")

const statControl = async (req, res) => {
  try {
    const tokens = await redis.get('tokens:latest');
    
    if (!tokens) {
      return res.status(404).json({
        success: false,
        error: 'No data available'
      });
    }

    const parsedTokens = JSON.parse(tokens);
    
    const stats = {
      totalTokens: parsedTokens.length,
      totalVolume: parsedTokens.reduce((sum, t) => sum + t.volume_sol, 0),
      totalMarketCap: parsedTokens.reduce((sum, t) => sum + t.market_cap_sol, 0),
      avgPriceChange: parsedTokens.reduce((sum, t) => sum + t.price_1hr_change, 0) / parsedTokens.length,
      topGainer: parsedTokens.reduce((max, t) => t.price_1hr_change > max.price_1hr_change ? t : max),
      topLoser: parsedTokens.reduce((min, t) => t.price_1hr_change < min.price_1hr_change ? t : min)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = statControl