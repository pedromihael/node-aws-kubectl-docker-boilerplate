const redis = require('redis');
const util = require('util');
const YAML = require('yaml');

const redisSubscriber = redis.createClient();
const redisPublisher = redis.createClient();

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client) {
  try {
    // const { stdout, stderr } = await exec('kubectl get ing -oyaml dial-adm-plus-prod');
    const { stdout, stderr } = await exec('cat ing.yaml');

    if (stdout) {
      const parsedYAML = YAML.parse(stdout);
      const parsedAnnotations = YAML.parse(
        parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'],
      );
      const newHost = { ...parsedAnnotations.spec.rules[0], host: `${client}.dialog.cm` };

      parsedAnnotations.spec.rules.push(newHost);
      parsedAnnotations.spec.tls[0].hosts.push(`${client}.dialog.cm`);

      // TODO: fix
      // - & a2
      // host: vanessa2.dialog.cm
      // http: *a1

      Object.assign(parsedYAML.metadata.annotations, {
        'kubectl.kubernetes.io/last-applied-configuration': parsedAnnotations,
      });

      // console.log(parsedYAML.spec.rules);

      parsedYAML.spec.rules.push(newHost);
      parsedYAML.spec.tls[0].hosts.push(`${client}.dialog.cm`);

      // console.log(parsedYAML.spec.tls[0]);

      return parsedYAML;
    }

    stderr && console.log('stderr:', stderr);
  } catch (err) {
    console.error('Error on cat and format ingress yaml file: ', err);
  }
}

async function applyUpdatedIngress(updatedIngress) {
  try {
    const updatedIngressYAML = YAML.stringify(updatedIngress);

    console.log('YAML', updatedIngressYAML);

    // const { stdout, stderr } = await exec(
    //   `touch dial-adm-plus.prod.yaml | echo ${updatedIngressYAML} > dial-adm-plus.prod.yaml | kubectl apply -f dial-dm-plus.prod.yaml`,
    // );

    const { stdout, stderr } = await exec(
      `touch dial-adm-plus.prod.yaml | echo ${updatedIngressYAML} > dial-adm-plus.prod.yaml`,
    );

    if (stdout) {
      // TODO: check k8s output and then publish ok to channel
    }

    const { stdout: catout } = await exec(`cat dial-adm-plus.prod.yaml`);

    // console.log('stdout', catout);
  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

redisSubscriber.subscribe('plusAccountCreation');

redisSubscriber.on('message', async (channel, message) => {
  if (channel === 'plusAccountCreation') {
    console.log(`New plus account: ${message}`);

    const updatedIngress = await catAndUpdateIngress(message);
    await applyUpdatedIngress(updatedIngress);

    // TODO: fix not writing

    const confirmattionMessage = 'Ingress updated and changes applied';

    redisPublisher.publish('plusAccountCreationResult', confirmattionMessage, () => {
      console.log(`Message sent to plusAccountCreationResult: ${confirmattionMessage}`);
    });
  }
});
