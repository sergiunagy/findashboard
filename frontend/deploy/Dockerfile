# ################################
# Base build
# - base image with nest cli installed
# - this is separate to be usable at an initial project creation
# ################################
ARG baseImage=node
ARG baseVersion=20-bullseye
FROM ${baseImage}:${baseVersion} as base

LABEL maintainer="sergiu.nagy"
LABEL scope="frontend"

# install Angular CLI
RUN npm install -g @angular/cli

# set up a directory for our app and prepare permissions
RUN mkdir -m 755 -p /home/node/app            
WORKDIR /home/node/app
# give ownership to the node user
RUN chown node:node /home/node/app

# switch user
USER node

# ################################
# Development build
# - image for development - requires the project and sources
# ################################
FROM base as development
# make available in container (debug and versioning)
ARG baseImage=node
ARG baseVersion=20-bullseye

ARG APP=findash-angular-app 

# copy package dependencies
RUN mkdir -p -m 755 /home/node/app/${APP}         
# set up workdir   
WORKDIR /home/node/app/${APP} 

# resolve permissions for user node for app files
RUN chown node:node /home/node/app/${APP}
COPY --chown=node:node ./app/${APP}/package*.json ./

# install dependencies
RUN npm ci

# copy app source files (workdir set on previous step)
COPY --chown=node:node ./app/${APP} .

# switch user 
USER node

# ################################
# Build stage - intermediate for PRODUCTION
# - reuse development since we won't keep the build and don't need it slim
# ################################
FROM development as build
ARG APP=findash-angular-app 

ENV NODE_ENV=production

# build 
RUN ng build

# clean the image before moving to  production
RUN npm ci --omit=dev && npm cache clean --force

USER node

###################
# Production build
# - slimmed image only containing the dist output
# - switch to nginx server
###################
FROM nginx:alpine-slim as production
ARG APP=findash-angular-app

LABEL maintainer="sergiu.nagy"

# copy build results to server
COPY --chown=node:node --from=build  /home/node/app/${APP}/dist/${APP} /usr/share/nginx/html
COPY --chown=node:node ./deploy/conf.d /etc/nginx/conf.d
EXPOSE 80