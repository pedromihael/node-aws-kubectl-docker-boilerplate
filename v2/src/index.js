const redis = require('redis');
const express = require('express')
const dotenv = require('dotenv')

const { applyUpdatedIngress } = require('./utils/applyUpdatedIngress')
const { catAndUpdateIngress } = require('./utils/catAndUpdateIngress')

dotenv.config()

const app = express()

const run = () => console.log('Script started. Ready to accept messages.');

app.listen(process.env.PORT, async () => {

  const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}`,
  });
  
  redisClient.subscribe('plusAccountCreation');

  redisClient.on('message', async (channel, message) => {
    if (channel === 'plusAccountCreation') {
    const splited = message.split(':');
    const client = splited[0];
    const environment = splited[1];
  
    console.log(`New plus account: ${client} in prod`);
  
    const parsedYAML = await catAndUpdateIngress(client, environment);
    await applyUpdatedIngress(parsedYAML, environment);
    }
  });

  run();
})

