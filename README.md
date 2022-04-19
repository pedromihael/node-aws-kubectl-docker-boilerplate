# Plus Client Creation Automatization
Deployable project in: `v2/`

Access the guide [here](https://remarkable-wrinkle-3fe.notion.site/Configura-o-Docker-K8S-EKS-e896b9136b5c457a985ba7b1b9bea385).

The script will retrieve the latest `dial-adm-plus-<env>` ingress from K8s, update the file with the new client and apply the changes. Then a Route53 hook set in K8s will create the register for this client.

When all work is done, the new client will be ready to use.