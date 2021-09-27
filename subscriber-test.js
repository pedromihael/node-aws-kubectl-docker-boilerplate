const redis = require("redis");

const redisClient = redis.createClient();

redisClient.subscribe("plusAccountCreationResult");

redisClient.on("message", (channel, message) => {
  console.log(message);
});