###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2022-03-05                                              ##
## version         : 2.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
ARG NODE_VERSION=16.13.1

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /opt

COPY package.json yarn.lock tsconfig.json tsconfig.compile.json .barrelsby.json knexfile.js processes.config.js jwt_private.pem jwt_public.pem ./

RUN yarn install --pure-lockfile

COPY ./src ./src
COPY ./seeds ./seeds
COPY ./migrations ./migrations

RUN yarn build

FROM node:${NODE_VERSION}-alpine as runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

RUN apk update && apk add build-base git curl
RUN npm install -g pm2

COPY --from=build /opt .

RUN yarn install --pure-lockfile --production

COPY processes.config.js .

EXPOSE 8081

CMD ["pm2-runtime", "start", "processes.config.js"]
