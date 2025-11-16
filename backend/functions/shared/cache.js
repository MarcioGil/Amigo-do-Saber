// Simple in-memory cache for Azure Functions
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function setCache(key, value) {
  cache[key] = { value, expires: Date.now() + CACHE_TTL };
}

function getCache(key) {
  const entry = cache[key];
  if (entry && entry.expires > Date.now()) {
    return entry.value;
  }
  return null;
}

module.exports = { setCache, getCache };
