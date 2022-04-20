const redis = require('redis');
const dotenv = require('dotenv')
const { createSubscriber } = require('./pubsub/subscribe')

dotenv.config()

const redisURL = {
  qa: 'redis://elasticacheredisdialogloginqa.mkkqil.ng.0001.sae1.cache.amazonaws.com:6379',
  prod: 'redis://redis-notification.internal.dialog.cm:6405',
  dev: ''
}

function createClient() {
  if (process.argv[2] != 'qa' && process.argv[2] != 'prod') {
    console.info('-> You are trying to access local redis.')
    console.info('-> To access QA redis use -e NODE_ENV="qa" in docker run.')
    console.info('-> To access PROD redis use -e NODE_ENV="prod" in docker run.')
  }

  console.info('-> Redis servers will connect only within AWS VPC.')

  const client = redis.createClient({ url: redisURL[process.argv[2]] })

  return client;
}

async function createSub(client) {
  const subscriber = await createSubscriber(client) 
  return subscriber;
}

module.exports = { createClient, createSub }