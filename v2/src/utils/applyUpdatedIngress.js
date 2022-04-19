const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

async function applyUpdatedIngress(updatedIngress, environment) {
  try {
    const { stdout: stdoutCreation, stderr: stderrCreation } = await exec(
      `touch ${path.join(__dirname, `/ingresses/dial-adm-plus.${environment}.yaml`)}`,
    );

    if (!stderrCreation) {
      fs.writeFileSync(`${path.join(__dirname, `/ingresses/dial-adm-plus.${environment}.yaml`)}`, updatedIngress, (err) => {
        console.log(err);
      });
  
      const apply = await exec(
        `kubectl apply -f ${path.join(__dirname, `/ingresses/dial-adm-plus.${environment}.yaml`)}`,
      );
      
      if (apply.stdout) {
        const splited = apply.stdout.split(' ');
  
        if (splited[splited.length - 1] === 'configured\n') {
          const confirmattionMessage = 'Ingress updated and changes applied';
          console.log(`${confirmattionMessage}`);
        }
      } else {
        console.log('error on apply ingress:', apply.stderr);
      }
    } else {
      console.log(stderrCreation)
    }

  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

module.exports = { applyUpdatedIngress }