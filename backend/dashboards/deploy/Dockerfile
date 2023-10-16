# ################################
# Base build
# - base image with nest cli installed
# - this is separate to be usable at an initial project creation
# ################################

ARG baseImage=node
ARG baseVersion=20-bullseye
FROM ${baseImage}:${baseVersion} as base

LABEL maintainer="sergiu.nagy"
LABEL scope="dashboards-backend-service"

# install the nest cli gloabally
RUN npm install -g @nestjs/cli

# set up a directory for our app andprepare permissions
RUN mkdir -m 755 -p /home/node/app            
WORKDIR /home/node/app
# give ownership to the node user
RUN chown node:node /home/node/app

USER node



# ################################
# Development build
# - image for development - requires the project and sources
# ################################

FROM base as development
# make available in container (debug and versioning)
ARG baseImage=node
ARG baseVersion=20-bullseye

# copy package dependencies
RUN mkdir -p -m 755 /home/node/app/dashboards           
WORKDIR /home/node/app/dashboards
# resolve permissions for user node for app files
RUN chown node:node /home/node/app/dashboards

COPY --chown=node:node ./app/dashboards/package*.json ./

# install dependencies
RUN npm ci

# copy app source files (workdir set on previous step)
COPY --chown=node:node ./app/dashboards .

USER node

# ################################
# Build stage - intermediate for production
# - slim image 
# ################################
FROM node:20-alpine As build

WORKDIR /home/node/app/dashboards

# get packages and sources from previous stage
COPY --chown=node:node --from=development /home/node/app/dashboards ./

# build 
RUN npm run build

# clean the image before moving to  production
RUN npm ci --omit=dev && npm cache clean --force

# set permissions to app source files
RUN chmod 755 /home/node/app/dashboards
RUN chown node:node /home/node/app/dashboards

USER node

###################
# Production build
# - slimmed image only containing the dist output
###################

FROM node:20-alpine As production

WORKDIR /home/node/app/dashboards

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /home/node/app/dashboards/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/dashboards/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]