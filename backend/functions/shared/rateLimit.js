// Simple rate limiting middleware for Azure Functions
const rateLimitMap = new Map();
const WINDOW_SIZE = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT) : 50;

module.exports = function rateLimit(context, req) {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-ms-client-ip'] || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < WINDOW_SIZE);
  if (timestamps.length >= MAX_REQUESTS) {
    context.res = { status: 429, body: { error: 'Limite de requisições atingido. Tente novamente mais tarde.' } };
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
};
