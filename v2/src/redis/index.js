const redis = require('redis');
const { createSubscriber } = require('./pubsub/subscribe')

function createClient() {
  const client = process.env.REDIS_HOST ? redis.createClient({
    url: `redis://${process.env.REDIS_HOST}`,
  }) : redis.createClient();

  return client;
}

async function createSub(client) {
  const subscriber = await createSubscriber(client) 
  return subscriber;
}

module.exports = { createClient, createSub }