# Dashboard-distributed app for stock data using Angular and a Python based backend

## Structure on disk

### The app
Sources, configurations and docs are locate in the app folder

### The service infrastructure
The application (both in dev and prod) runs from Docker containers.
The infrastructure is defined in the deploy folder yml and docker file.  

**Note**:
- for the first project setup (no files exist yet on drive and no commit has been made in Git) please use the initial_setup.bash to run an automated setup.

## Functionality

## Libraries and build tools

We use bootstrap as a styling library.  
We use NodeJs to serve the app during development and provide the build toolchain.  
We use Nginx to serve the app in production.

The documentation and diagrams are created using drawio (a VSCode plugin exists as well as a standalone app).

## Finnhub api
The online data is produced by the finnhub.io provided REST apis

### Authentication
Authentication is required for all requests sent to the API.
The Authentication is provied in the form of a per-user token (api-key).  

**Note**:
- It may have previously possible to generate a token programmaticaly but there is no longer an API providing this functionality.

### Documentation
Api documentation is provided in HTML format: https://finnhub.io/docs/api.

### Swagger api docs
It is also available in Swagger format (allowing diret tests after authentication): https://finnhub.io/static/swagger.json.  
To inspect it, use the online editor provided at: https://editor.swagger.io/ and load the json format swagger API (alternatively an editor can be set up locally).  
This allows a closer inspection of the API as well as manually testing it.
![swagger editor screenshot](./readme_imgs/SwaggerEditor.png)


## Running the app

### Dev mode

From the deploy folder: 
- docker compose --profile dev up