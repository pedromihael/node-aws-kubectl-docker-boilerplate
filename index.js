const redis = require('redis');
const util = require('util');
const YAML = require('js-yaml');
const fs = require('fs');

// const redisSubscriber = redis.createClient();

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  console.log(environment);

  try {
    const { stdout, stderr } = await exec(`cat dev_assets/ing.${environment}.yaml`); // dev

    // const { stdoutk8s, stderrk8s } = await exec(
    //   `kubectl get ing -oyaml dial-adm-plus-${environment} > ~/pedro/ing.${environment}.yaml`,
    // );

    // const { stdout, stderr } = await exec(`cat ~/pedro/ing.${environment}.yaml`);

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
    const { stdoutCreation, stderrCreation } = await exec(
      `touch ./dev_assets/dial-adm-plus.${environment}.yaml`,
    );

    fs.writeFile(`./dev_assets/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
      console.log(err);
    });

    // const { stdoutCreation, stderrCreation } = await exec(
    //   `touch ~/ingresses/dial-adm-plus.${environment}.yaml`,
    // );

    // if (stderrCreation) {
    //   console.log(stderrCreation);
    // }

    // fs.writeFile(`~/ingresses/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
    //   console.log(err);
    // });

    // const { stdoutApply, stderrApply } = await exec(
    //   `kubectl apply -f ~/ingresses/dial-adm-plus.${environment}.yaml`,
    // );

    const stdoutApply = true;

    if (stdoutApply) {
      // const splited = stdoutApply.split(' ');
      const splited = ['configured'];

      if (splited[splited.length - 1] === 'configured') {
        const confirmattionMessage = 'Ingress updated and changes applied';
        console.log(`${confirmattionMessage}`);
      }
    }

    // if (stderrApply) {
    //   console.log('error on apply ingress:', stderrApply);
    // }
  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

function run() {
  console.log('Script started. Ready to accept messages.');
}

// redisSubscriber.subscribe('plusAccountCreation');

// redisSubscriber.on('message', async (channel, message) => {
// if (channel === 'plusAccountCreation') {
// const splited = message.split(':');
// const client = splited[0];
// const environment = splited[1];

const client = 'rangel';
console.log(`New plus account: ${client} in prod`);

// const parsedYAML = await catAndUpdateIngress(client, environment);
// await applyUpdatedIngress(parsedYAML, environment);

catAndUpdateIngress(client, 'prod').then(async (parsedYAML) => {
  await applyUpdatedIngress(parsedYAML, 'prod');
});

// }
// });

// run();
