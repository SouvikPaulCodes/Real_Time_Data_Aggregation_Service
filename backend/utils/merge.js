function mergeTokens(sources) {
  const tokenMap = new Map();

  sources.flat().forEach(token => {
    const key = token.token_address.toLowerCase();
    
    if (tokenMap.has(key)) {
      const existing = tokenMap.get(key);
      // Keep the one with more data or higher volume
      if (token.volume_sol > existing.volume_sol) {
        tokenMap.set(key, token);
      }
    } else {
      tokenMap.set(key, token);
    }
  });

  return Array.from(tokenMap.values());
}

module.exports = mergeTokens