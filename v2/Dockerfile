FROM node:14-alpine

WORKDIR /usr/app

ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_DEFAULT_REGION=sa-east-1
ENV AWS_DEFAULT_OUTPUT=json
ENV ENV=QA
ENV PATH=/root/.local/bin:$PATH


COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .

RUN apk add sudo curl openssl bash --no-cache
RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x ./kubectl \
    && mv ./kubectl /usr/local/bin/kubectl
    # && curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 \
    # && chmod +x get_helm.sh && ./get_helm.sh \
    # && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    # && unzip awscliv2.zip

RUN apk add python3 py3-pip --no-cache \
    && pip3 install --upgrade pip \
    && pip3 install --no-cache-dir awscli \
    && rm -rf /var/cache/apk/*

RUN aws --version   # Just to make sure its installed alright

CMD ["node", "index.js"]

