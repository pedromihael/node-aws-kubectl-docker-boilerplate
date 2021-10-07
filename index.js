const redis = require('redis');
const util = require('util');
const YAML = require('yaml');

const redisSubscriber = redis.createClient();
const redisPublisher = redis.createClient();

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  try {
    // const { stdout, stderr } = await exec(`kubectl get ing -oyaml dial-adm-plus-${environment}`);

    const { stdout, stderr } = await exec(`cat dev_assets/ing.${environment}.yaml`); // dev

    if (stdout) {
      const parsedYAML = YAML.parse(stdout);
      const parsedAnnotations = YAML.parse(
        parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'],
      );

      const newHost = {
        ...parsedAnnotations.spec.rules[0],
        host: `${client}.dialog.${environment}`,
      };

      const YAMLNode = YAML.createNode(newHost);

      parsedAnnotations.spec.rules.push(YAMLNode);

      environment === 'prod' && parsedAnnotations.spec.tls[0].hosts.push(`${client}.dialog.cm`);

      const YAMLAnnotations = new YAML.Document(parsedAnnotations);
      const json = JSON.stringify(YAML.parse(YAMLAnnotations), null, '  ');

      Object.assign(parsedYAML.metadata.annotations, {
        'kubectl.kubernetes.io/last-applied-configuration': json,
      });

      parsedYAML.spec.rules.push(YAMLNode);

      environment === 'prod' && parsedYAML.spec.tls[0].hosts.push(`${client}.dialog.cm`); //só em prod

      return parsedYAML;
    }

    stderr && console.log('stderr:', stderr);
  } catch (err) {
    console.error('Error on cat and format ingress yaml file: ', err);
  }
}

async function applyUpdatedIngress(updatedIngress, environment) {
  try {
    const YAMLDoc = new YAML.Document();
    YAMLDoc.contents = updatedIngress;

    const { stdout, stderr } = await exec(
      `touch dev_assets/dial-adm-plus.${environment}.yaml | echo "${YAMLDoc.toString()}" | dd of=dev_assets/dial-adm-plus.${environment}.yaml`,
    );

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

const client = 'teste';
const environment = 'qa';

console.log(`New plus account: ${client} in ${environment}`);

catAndUpdateIngress(client, environment).then((updated) => {
  applyUpdatedIngress(updated, environment);
});

const confirmattionMessage = 'Ingress updated and changes applied';

// redisPublisher.publish('plusAccountCreationResult', confirmattionMessage, () => {
//   console.log(`Message sent to plusAccountCreationResult: ${confirmattionMessage}`);
// });
// }
// });
