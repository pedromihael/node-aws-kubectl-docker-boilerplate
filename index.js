const redis = require('redis');
const util = require('util');
const YAML = require('js-yaml');
const fs = require('fs');
const stringifyYAML = require('./utils/stringfyYAML');

const redisSubscriber = redis.createClient();
const redisPublisher = redis.createClient();

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  try {
    // const { stdout, stderr } = await exec(`kubectl get ing -oyaml dial-adm-plus-${environment}`);

    const { stdout, stderr } = await exec(`cat dev_assets/ing.${environment}.yaml`); // dev

    if (stdout) {
      // const parsedYAML = YAML.parse(stdout, 'utf8', { schema: 'failsafe', keepBlobsInJSON: true });

      const parsedYAML = YAML.load(stdout);

      const stringAnnotations = parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];

      parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = YAML.dump(stringAnnotations);

      console.log(YAML.dump(stringAnnotations).split('>'));

      const newHost = {
        host: `${client}.dialog.${environment}`,
        http: YAML.load(YAML.dump(parsedYAML.spec.rules[0].http)),
      };

      parsedYAML.spec.rules.push(newHost);

      return YAML.dump(parsedYAML);
    }

    stderr && console.log('stderr:', stderr);
  } catch (err) {
    console.error('Error on cat and format ingress yaml file: ', err);
  }
}

async function applyUpdatedIngress(updatedIngress, environment) {
  try {
    const { stdout, stderr } = await exec(`touch dev_assets/dial-adm-plus.${environment}.yaml`);

    fs.writeFile(`./dev_assets/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
      console.log(err);
    });

    if (stdout) {
      // TODO: check k8s output and then publish ok to channel
    }
  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

redisSubscriber.subscribe('plusAccountCreation');

// redisSubscriber.on('message', async (channel, message) => {
// if (channel === 'plusAccountCreation') {
// const splited = message.split(':');
// const client = splited[0];
// const environment = splited[1];

const client = 'hoteis-othon';
const environment = 'qa';

console.log(`New plus account: ${client} in ${environment}`);

catAndUpdateIngress(client, environment).then((parsedYAML) => {
  applyUpdatedIngress(parsedYAML, environment);
});

const confirmattionMessage = 'Ingress updated and changes applied';

// redisPublisher.publish('plusAccountCreationResult', confirmattionMessage, () => {
//   console.log(`Message sent to plusAccountCreationResult: ${confirmattionMessage}`);
// });
// }
// });
