# ################################
# Development build
# - image for development - requires the project and sources
# ################################
ARG baseImage=python
ARG baseVersion=3.11.6-slim 
# SQLAlchemy fails to install on 3.12
FROM ${baseImage}:${baseVersion} as development
# make available in container (debug and versioning)
ARG baseImage=python
ARG baseVersion=3.11.6-slim

LABEL maintainer="sergiu.nagy"

WORKDIR /home/app

COPY ./deploy/dependencies dependencies
RUN pip install --upgrade pip
RUN pip install -r dependencies

# ################################
# Production build
# - not much difference. We re-use also the base since the libraries
# require extensive work to enable on Alpine
# ################################
FROM development as production

# pull current sources from folder 
COPY ./src /home/app

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]