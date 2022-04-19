async function createSubscriber(redisClient) {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  return subscriber
}

module.exports = { createSubscriber }