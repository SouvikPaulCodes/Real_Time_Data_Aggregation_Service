const CONFIG = require("../config/config")

async function retryWithBackoff(fn, retries = CONFIG.MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = Math.pow(CONFIG.BACKOFF_MULTIPLIER, i) * 1000;
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = retryWithBackoff