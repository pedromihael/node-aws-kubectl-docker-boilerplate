const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

async function applyUpdatedIngress(updatedIngress, environment) {
  try {
    const { stdout: stdoutCreation, stderr: stderrCreation } = await exec(
      `touch ~/ingresses/dial-adm-plus.${environment}.yaml`,
    );

    if (!stderrCreation) {
      fs.writeFile(`~/ingresses/dial-adm-plus.${environment}.yaml`, updatedIngress, (err) => {
        console.log(err);
      });
  
      const { stdout: stdoutApply, stderr: stderrApply } = await exec(
        `kubectl apply -f ~/ingresses/dial-adm-plus.${environment}.yaml`,
      );
      
      if (stdoutApply) {
        const splited = stdoutApply.split(' ');
  
        if (splited[splited.length - 1] === 'configured') {
          const confirmattionMessage = 'Ingress updated and changes applied';
          console.log(`${confirmattionMessage}`);
        }
      } else {
        if (stderrApply) {
          console.log('error on apply ingress:', stderrApply);
        }
      }
    } else {
      console.log(stderrCreation)
    }

  } catch (err) {
    console.error('Error on apply updated ingress yaml file: ', err);
  }
}

module.exports = { applyUpdatedIngress }