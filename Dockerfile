FROM node:14-alpine

# Diretorio da aplicação dentro do container
WORKDIR /usr/app

# Copiando o package json e yarn lock para poder instalar as dependencias
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Copiando o restante dos arquivos
COPY . .