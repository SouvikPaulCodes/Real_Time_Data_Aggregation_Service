const CONFIG = {
  CACHE_TTL: 30, // seconds
  FETCH_INTERVAL: 15, // seconds
  RATE_LIMIT_DELAY: 250, // ms between API calls
  MAX_RETRIES: 3,
  BACKOFF_MULTIPLIER: 2
};

module.exports = CONFIG;