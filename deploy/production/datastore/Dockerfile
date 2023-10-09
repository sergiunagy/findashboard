ARG baseImage=mongo
ARG baseVersion=6.0

FROM ${baseImage}:${baseVersion}

ARG baseImage=mongo
ARG baseVersion=6.0
LABEL maintainer="sergiu.nagy"

# database seeding preparation: scripts in this folder get executed at container start
COPY init.sh /docker-entrypoint-initdb.d
COPY database-seed database-seed

# set  up import tool for database seed (init.sh) so it runs also in Windows
RUN apt-get update && apt-get install dos2unix && dos2unix /docker-entrypoint-initdb.d/init.sh
