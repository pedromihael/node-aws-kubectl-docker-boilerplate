# base image: Node JS
FROM node:14-alpine

# work directory, all files will be placed in this path
WORKDIR /usr/app

# argument received from --build-arg in `docker build`
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# argument received from --build-arg in `docker build`
ARG AWS_ACCESS_KEY
ENV AWS_ACCESS_KEY=${AWS_ACCESS_KEY}

# argument received from --build-arg in `docker build`
ARG AWS_DEFAULT_REGION
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}

ENV PATH=/root/.local/bin:$PATH

# copy all files from local root to docker container root
COPY . .

# copy files
COPY package.json ./
COPY yarn.lock ./

# run yarn to install nodejs project dependencies
RUN yarn install

# add curl, openssl and bash
RUN apk add curl openssl bash --no-cache

# add kubectl binary 
RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x ./kubectl \
    && mv ./kubectl /usr/local/bin/kubectl

# add aws-cli binary
RUN apk add python3 py3-pip --no-cache \
    && pip3 install --upgrade pip \
    && pip3 install --no-cache-dir awscli \
    && rm -rf /var/cache/apk/*

# give execution permission to script
RUN chmod +x start.sh

# this command will be executed when run `docker run`
CMD ./start.sh ${AWS_DEFAULT_REGION} ${AWS_ACCESS_KEY} ${AWS_SECRET_ACCESS_KEY}