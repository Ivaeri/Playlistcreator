const { createClient } = require('redis');

const redis = createClient({
  url: 'redis://127.0.0.1:6379', // eller 127.0.0.1
});

redis.connect().catch(console.error);

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Exportera Redis-klienten
module.exports = redis;