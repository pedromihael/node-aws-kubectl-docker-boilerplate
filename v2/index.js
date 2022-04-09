const util = require('util');
const express = require('express')
const app = express()

app.listen(3003, () => {
  const exec = util.promisify(require('child_process').exec);
  exec(`kubectl get pods`).then(res => {
    if (res.stdout) {
      console.log("funcionando:")
      console.log(res.stdout)
    } else {
      console.log("quebrado:")
      console.log(res.stderr)
    }
  }).catch(err => {
    console.log("err")
    console.log(err)
  })
})
