# ################################
# Development build
# - image for development - requires the project and sources
# ################################
ARG baseImage=python
ARG baseVersion=3.11.4-bullseye as development
# SQLAlchemy fails to install on 3.12
FROM ${baseImage}:${baseVersion}

ARG baseImage=python
ARG baseVersion=3.11.4-bullseye

LABEL maintainer="sergiunb"

WORKDIR /home/app

COPY dependencies dependencies
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