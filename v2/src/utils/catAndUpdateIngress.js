const util = require('util');
const YAML = require('js-yaml');

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  console.log(environment);

  try {
    const { stdout, stderr } = await exec(
      `kubectl get ing -oyaml dial-adm-plus-${environment} > ~/ingresses/ing.${environment}.yaml`,
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

module.exports = { catAndUpdateIngress }