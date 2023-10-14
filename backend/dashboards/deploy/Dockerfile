FROM node:20-bullseye

LABEL scope="nestjstraining"

# install the nest cli gloabally
RUN npm install -g @nestjs/cli

# set up a directory for our app
RUN mkdir -p /home/node/app            
WORKDIR /home/node/app



# Build with:
# docker build -f ./Dockerfile -t node-angular-app