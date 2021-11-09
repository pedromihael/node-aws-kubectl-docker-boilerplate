const redis = require('redis');
const util = require('util');
const YAML = require('js-yaml');
const fs = require('fs');

const redisSubscriber = redis.createClient();
const redisPublisher = redis.createClient();

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  try {
    // const { stdout, stderr } = await exec(`cat dev_assets/ing.${environment}.yaml`); // dev

    const { stdout, stderr } = await exec(
      `kubectl get ing -oyaml ~/dev/ingresses/dial-adm-plus-${environment}`,
    );

    if (stdout) {
      const parsedYAML = YAML.load(stdout);

      const stringAnnotations = parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];

      parsedYAML.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = YAML.dump(stringAnnotations);

      const envDomain = environment === 'prod' ? 'cm' : 'qa';

      const newHost = {
        host: `${client}.dialog.${envDomain}`,
        http: YAML.load(YAML.dump(parsedYAML.spec.rules[0].http)),
      };

      parsedYAML.spec.rules.push(newHost);
      envDomain === 'cm' && parsedYAML.spec.tls[0].hosts.push(`${client}.dialog.${envDomain}`);

      return YAML.dump(parsedYAML);
    }

    stderr && console.log('stderr:', stderr);
  } catch (err) {
    console.error('Error on cat and format ingress yaml file: ', err);
  }
}

async function applyUpdatedIngress(updatedIngress, environment) {
  try {
    // const { stdoutCreation, stderrCreation } = await exec(
    //   `touch ./dev_assets/dial-adm-plus.${environment}.yaml`,
    // );

    // fs.writeFile(`./dev_assets/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
    //   console.log(err);
    // });

    const { stdoutCreation, stderrCreation } = await exec(
      `touch ~/dev/ingresses/dial-adm-plus.${environment}.yaml`,
    );

    fs.writeFile(`~/dev/ingresses/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
      console.log(err);
    });

    const { stdoutApply, stderrApply } = await exec(
      `kubectl apply -f ~/dev/ingresses/dial-adm-plus.${environment}.yaml`,
    );

    if (stdoutApply) {
      const splited = stdoutApply.split(' ');
      // const splited = ['configured'];

      if (splited[splited.length - 1] === 'configured') {
        const confirmattionMessage = 'Ingress updated and changes applied';

        redisPublisher.publish('plusAccountCreationResult', confirmattionMessage, () => {
          console.log(`Message sent to plusAccountCreationResult: ${confirmattionMessage}`);
        });
      } else {
        redisPublisher.publish('plusAccountCreationResult', 'stdoutApply', () => {
          console.log(`Message sent to plusAccountCreationResult: ${'stdoutApply'}`);
        });
      }
    }

    if (stderrApply) {
      console.log('error on apply ingress:', stderrApply);
    }
  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

function run() {
  console.log('Script started. Ready to accept messages.');
}

redisSubscriber.subscribe('plusAccountCreation');

redisSubscriber.on('message', async (channel, message) => {
  if (channel === 'plusAccountCreation') {
    const splited = message.split(':');
    const client = splited[0];
    const environment = splited[1];
    console.log(`New plus account: ${client} in ${environment}`);

    const parsedYAML = await catAndUpdateIngress(client, environment);
    await applyUpdatedIngress(parsedYAML, environment);
  }
});

run();
