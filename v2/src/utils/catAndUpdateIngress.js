const util = require('util');
const YAML = require('js-yaml');
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

const exec = util.promisify(require('child_process').exec);

async function catAndUpdateIngress(client, environment) {
  try {
    await mkdirp(path.join(__dirname, '/ingresses'))

    await exec(
      `kubectl get ing -oyaml dial-adm-plus-${environment} > ${__dirname}/ingresses/ing.${environment}.yaml`,
    );

    const ing = fs.readFileSync(path.join(__dirname, `/ingresses/ing.${environment}.yaml`), 'utf-8')

    if (ing) {
      const parsedYAML = YAML.load(ing);

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
  } catch (err) {
    console.error('Error on cat and format ingress yaml file: ', err);
  }
}

module.exports = { catAndUpdateIngress }