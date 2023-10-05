# #################################
# Project initialization script
#
# This script will perform the following:
# - build a nodeJS image with and installed Angular client
# - initialize  the project using a client default setup. This will create the defauls Angular app folder structure in the app folder
# #############################################

# build the image
echo Building image ..
docker build -t sergiunagy/findash-angular-app .

# run initial project creation using an ephemeral container.
# Note: 
#  - use a non-root user to avoid permission issues when bind-mounting to host local drive
#  - this bind-mounts to the local drive. TODO : test volume mounting, if it makes sense
#  - the app configuration is pretty basic and is hardcoded here. TODO: add configuration values as variables
echo Running initial project generation to $(pwd)/../app
docker run --rm -u node -v $(pwd)/../app:/home/node/app sergiunagy/findash-angular-app ng new findash-angular-app --strict false --skip-git --routing false

# ----------------------
# Setup extra packages - separate steps, for easy tailoring

# UNTESTED - TODO - rebuild image and test
docker run --rm -u node -v $(pwd)/../app:/home/node/app sergiunagy/findash-angular-app sh -c "cd findash-angular-app && npm install --save  moment"
# UNTESTED -END

# Add material themes and packages: 
docker run --rm -u node -v $(pwd)/../app:/home/node/app sergiunagy/findash-angular-app sh -c "cd findash-angular-app && npm install --save  @angular/material @angular/cdk && ng add @angular/material"

# add the bootstrap module
docker run --rm -u node -v $(pwd)/../app:/home/node/app sergiunagy/findash-angular-app sh -c "cd findash-angular-app && npm install --save bootstrap"

# add the d3js module
docker run --rm -u node -v $(pwd)/../app:/home/node/app sergiunagy/findash-angular-app sh -c "cd findash-angular-app && npm install --save npm i --save d3 && npm i --save-dev @types/d3"


#  npm install --save  @angular/material @angular/cdk
# ng ng add @angular/material 
# #########################################
# RUN
# From Ubuntu or WSL2 terminal run with :
# bash initial_setup.bash 

# After init
# - once the first init is complete, you can user Docker Compose to launch services and serve the web app.