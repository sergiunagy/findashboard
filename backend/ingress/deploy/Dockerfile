# #########################
# Nginx Web server image 
# - development and production 
# 
# Contains:  
#  - official owasp/modsec for nginx image with core rules set up
#  - development/debug tools for system and processes control
#  
# Use:
#  - Include as service in deployed cluster/setup
#  - 
# ##########################

# ####################
# Development (and test) build
# ################
ARG baseImage=owasp/modsecurity-crs
ARG baseVersion=3.3.4-nginx-202209221209
FROM ${baseImage}:${baseVersion} as development
# make available in container (debug and versioning)
ARG baseImage=owasp/modsecurity-crs
ARG baseVersion=3.3.4-nginx-202209221209

LABEL maintainer="sergiu.nagy"

# install service/system and network utilities for debug purposes
RUN apt-get update \
        && apt-get install systemd -y \
        && apt-get install net-tools -y \ 
        && apt-get install procps -y

# add the reverse_proxy configurations
# COPY config/reverse_proxy.conf "/etc/nginx/conf.d/reverse_proxy.conf"
COPY config /etc/nginx/conf.d
# overwrite the deault server configuration
COPY config/default_template.conf "/etc/nginx/templates/conf.d/default.conf.template"

# ####################
# Production build
# ################
ARG baseImage=owasp/modsecurity-crs
ARG baseVersion=3.3.4-nginx-202209221209
FROM ${baseImage}:${baseVersion} as production
ARG baseImage=owasp/modsecurity-crs
ARG baseVersion=3.3.4-nginx-202209221209
LABEL maintainer="sergiu.nagy"

COPY --from=development /etc/nginx/conf.d /etc/nginx/conf.d
COPY --from=development /etc/nginx/templates/conf.d/default.conf.template /etc/nginx/templates/conf.d/default.conf.template