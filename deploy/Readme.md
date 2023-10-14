# Deployment profiles description

We use 3 profiles for deploying the app:
- dev
- test
- prod

Spin up the services associated with a profile using :
        docker compose --profile <dev | test | prod> up

# Profiles scope and rationale:

## Dev

Profile intended for development.
Image build is enabled and the images are bind-mounted to local host source folders.
Hot-replace is enbabled for all services.
Uses an in-mem database solution, preloaded with a couple of samples to facilitate quick tests during development.

## Test 

Profile for testing service integrations.
Image build is enabled and the images are bind-mounted to local host source folders.
Hot-replace is enbabled for all services.
Uses a database-as a service pattern and spins up a database server.
Note:
- the server is currently not mapped to a volume for persisisting between server resets

Contains an extra service for checking the database using a dedicated admin tool.

## Prod

Profile for deploying services.
Image building is disabled and code is running from the images directly.
Uses a database-as a service pattern and spins up a database server.