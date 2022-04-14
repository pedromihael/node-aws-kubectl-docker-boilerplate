#!/bin/sh

#
# ---------------------------------------------------------------------
# Dialog Plus Client Creation startup script.
# ---------------------------------------------------------------------
#

# Configure AWS CLI with passed args

aws configure set aws_access_key_id $2
aws configure set aws_secret_access_key $3
aws configure set default.region $1

# Connect local kubectl to eks
aws eks update-kubeconfig --region sa-east-1 --name qa-cm-eks-master

# Start the script
node src/index.js