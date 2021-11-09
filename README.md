# Plus Client Creation Automatization

Run `docker-compose up` to start redis and the script.

All messages should be sent to the topic `plusAccountCreation` with the format `<new-client-slug>:<environment>` (i.e. "dialog-test:prod").

The script will retrieve the latest `dial-adm-plus-<env>` ingress from K8s, update the file with the new client and apply the changes. Then a Route53 hook set in K8s will create the register for this client.

When all work is done, the new client will be ready to use.