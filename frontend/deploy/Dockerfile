FROM node:20-bullseye

LABEL scope="findashboard-frontend"

# install Angular CLI
RUN npm install -g @angular/cli

# set up a directory for our app
RUN mkdir -p /home/node/app            
WORKDIR /home/node/app

# Build with:
# docker build -f ./Dockerfile -t node-angular-app
# http://localhost:4200/
# ng new node-angular-app --no-strict
# ? Would you like to add Angular routing? No
# ? Which stylesheet format would you like to use? CSS
# ng serve
