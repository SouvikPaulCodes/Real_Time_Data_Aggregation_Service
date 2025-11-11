const redis = require("../config/redis")
const aggregateTokenData = require("../utils/aggregate")

const baseControl = async (req, res) => {
  try {
    const { limit = 50, sortBy = 'market_cap_sol', order = 'desc' } = req.query;

    let tokens = await redis.get('tokens:latest');
    
    if (!tokens) {
      const freshData = await aggregateTokenData();
      tokens = JSON.stringify(freshData);
    }

    let parsedTokens = JSON.parse(tokens);

    parsedTokens.sort((a, b) => {
      const valA = a[sortBy] || 0;
      const valB = b[sortBy] || 0;
      return order === 'asc' ? valA - valB : valB - valA;
    });

    parsedTokens = parsedTokens.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: parsedTokens.length,
      data: parsedTokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/tokens:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const addressControl = async (req, res) => {
  try {
    const { address } = req.params;
    const tokens = await redis.get('tokens:latest');
    
    if (!tokens) {
      return res.status(404).json({
        success: false,
        error: 'No token data available'
      });
    }

    const parsedTokens = JSON.parse(tokens);
    const token = parsedTokens.find(
      t => t.token_address.toLowerCase() === address.toLowerCase()
    );

    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {baseControl, addressControl};