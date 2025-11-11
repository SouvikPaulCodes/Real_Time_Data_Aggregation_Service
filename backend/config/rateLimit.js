const CONFIG = require("./config")

class RateLimiter {
  constructor(delayMs) {
    this.delayMs = delayMs;
    this.lastCallTime = 0;
  }

  async wait() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < this.delayMs) {
      await new Promise(resolve => 
        setTimeout(resolve, this.delayMs - timeSinceLastCall)
      );
    }
    this.lastCallTime = Date.now();
  }
}

const rateLimiter = new RateLimiter(CONFIG.RATE_LIMIT_DELAY);

module.exports = {rateLimiter}