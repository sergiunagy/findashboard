# #########################
# Nginx Web server image
# - Web UI host deployment
#  
# ##########################

ARG baseImage=nginx
ARG baseVersion=alpine-slim
FROM ${baseImage}:${baseVersion}
# Args get removed after FROM -> reinit them in case we want them in env vars
ARG baseImage=nginx
ARG baseVersion=alpine-slim

LABEL maintainer="sergiu.nagy"

# add the reverse_proxy configurations
COPY out/findash-angular-app /usr/share/nginx/html

