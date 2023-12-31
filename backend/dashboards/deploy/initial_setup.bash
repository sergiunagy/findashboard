# #################################
# Project initialization script
#
# This script will perform the following:
# - build a nodeJS image with and installed Angular client
# - initialize  the project using a client default setup. This will create the defauls Angular app folder structure in the app folder
# #############################################

# script constants
IMG_NAME="sergiunb/dashboards-nest"
APP_NAME="dashboards"
CONTAINER_PATH_APP="/home/node/app"
APP_GENERATION_OPTS="-p npm -l ts --skip-git"
APP_EXTRA_PCKGS="class-validator class-transformer @nestjs/typeorm typeorm sqlite3 @nestjs/config pg"

# create the folder on the host 
# - avoids permission issue (image is built with root and will constrain access to app folder, node user used for package and project will be prohibited
mkdir ../app

# build the image
echo Building image ..
docker build -t $IMG_NAME --target base .

# run initial project creation using an ephemeral container.
echo Running initial project generation to $(pwd)/../app
docker run --rm -u node -v $(pwd)/../app:$CONTAINER_PATH_APP $IMG_NAME nest new $APP_NAME $APP_GENERATION_OPTS

docker run --rm -u node -v $(pwd)/../app:$CONTAINER_PATH_APP $IMG_NAME sh -c "cd $APP_NAME && npm install --save $APP_EXTRA_PCKGS"