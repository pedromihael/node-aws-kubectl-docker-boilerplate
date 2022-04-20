const express = require('express')
const {createClient, createSub} = require('./redis/')

const { applyUpdatedIngress } = require('./utils/applyUpdatedIngress')
const { catAndUpdateIngress } = require('./utils/catAndUpdateIngress')

const app = express()

const run = () => console.log('Script started. Ready to accept messages.');

app.listen(process.env.PORT, async () => {
  run();

  const redisClient = createClient();
  const redisSub = await createSub(redisClient);

  await redisSub.subscribe('plusAccountCreation', async (message) => {
    const splited = message.split(':');
    const client = splited[0];
    const environment = splited[1];

    console.log(`New plus account: ${client} in ${environment}`);

    const parsedYAML = await catAndUpdateIngress(client, environment);
    await applyUpdatedIngress(parsedYAML, environment);
  });
})

