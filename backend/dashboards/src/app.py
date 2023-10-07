import os 
import json
from typing import Optional
from fastapi import FastAPI, Request, Response, status, APIRouter
from fastapi.responses import Response, HTMLResponse, PlainTextResponse
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from models.dashboard import Dashboard
# from client import html
# ------- DB stuff
# from db import models
# from db.database import engine
import time # for some performance tests

MONGODB_SERVER_PORT=27017
MONGODB_BACKEND = 'mongodb://findemoadmin:findemoadmin_pas_951@datastore-server:27017'
DATABASE = 'dashboards'

FRONTEND_HOST = os.environ.get('FRONTEND_HOST', None)


def _get_db_handle():
    """ 
    Connect to the Database and return a handle for operations

    Returns
    -------
    - db - database handle
    - client - mongo client handle for connection level operations (i.e. close)
    """

    client = MongoClient(host=MONGODB_BACKEND, port=27017)
    db = client[DATABASE]

    return db, client


app = FastAPI()
# set up CORS for same-machine access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_HOST],        # same domain in case of testing
    allow_credentials=True,             # allow cookies and credentials
    allow_methods = ['*'],              # all methods
    allow_headers = ['*']               # all headers
)


# -----  Routers - none for this app, we can keep all apis local to module

# ------ APIs
@app.get("/api/v1/dashboards/load", 
        tags=['dashboards'], 
        summary='retrieve a dashboard configuration',
        description=f'Returns a Dashboard profile given a user/owner and a dashboard name',
        )
async def find_dashboard_for_user_and_name(user: str, dashboard_name:str):
    """
    Retrieves a Dashboard profile given a user/owner and a dashboard name

    Parameters
    ----------
    - user - the user id passed as a query parameter
    - dashboardname - as a query parameter

    Response
    --------
    - 
    """
    dashboard = _find_dashboard_by_owner_and_name(user, dashboard_name)
    
    return dashboard


@app.get("/api/v1/dashboards/loadlast", 
        tags=['dashboards'], 
        summary='retrieve a dashboard configuration',
        description=f'Returns a Dashboard profile given a user/owner and a dashboard name',
        )
async def find_last_updated_dashboard_for_user(user: str):
    """
    Retrieves a Dashboard profile given a user/owner and a dashboard name

    Parameters
    ----------
    - user - the user id passed as a query parameter
    - dashboardname - as a query parameter

    Response
    --------
    - 
    """
    last_updated_dashboard = _find_last_updated_dashboard_by_user(user)
    
    return {'dashboard': last_updated_dashboard}


@app.get("/api/v1/dashboards/findall", 
        tags=['dashboards'], 
        summary='retrieve all dashboard configurations given a user',
        )
async def find_all_dashboards_for_user(user: str):
    """
    Retrieves a Dashboard profile given a user/owner and a dashboard name

    Parameters
    ----------
    - user - the user id passed as a query parameter
    - dashboardname - as a query parameter

    Response
    --------
    - 
    """
    last_updated_dashboard = _find_all_dashboards_by_user(user)
    
    return last_updated_dashboard


@app.post("/api/v1/dashboards/save", 
        tags=['dashboards'], 
        summary='save a dashboard configuration',
        description=f'Stores a Dashboard profile given',
        )
async def save_dashboard(user: str , dashboard:Dashboard):
# async def save_dashboard(request:Request):
    """
    Retrieves a Dashboard profile given a user/owner and a dashboard name

    Parameters
    ----------
    - user - the user id passed as a query parameter
    - dashboardname - as a query parameter

    Response
    --------
    - 
    """

    saved  = _save_dashboard(user, dashboard) 
    return {saved is not None}
    

def _find_dashboard_by_owner_and_name(user:str, dashboard_name:str):
    # ########### DB OPERATIONS 
    db,client =_get_db_handle()
    print(user, dashboard_name)

    dashboard = db['dashboard'].find_one({"ownerid":user, "name":dashboard_name}, projection={"_id":0})

    client.close()

    return {'dashboard':dashboard}

def _find_last_updated_dashboard_by_user(user):
    # ########### DB OPERATIONS 
    db, client =_get_db_handle()

    dashboard = db["dashboard"].aggregate([
           {"$match": {"ownerid":user}}, 
           {"$sort": {"unixTimestamp": -1}},
           {"$limit": 1 },
           {"$unset":["_id", "ownerid"]}
        ]).next()

    client.close()
    return dashboard

def _find_all_dashboards_by_user(user):
    # ########### DB OPERATIONS 
    db, client =_get_db_handle()

    # simply convert to list here, no big data expected
    dashboards = list(db["dashboard"].find({"ownerid":user}, projection={"_id":0}))

    client.close()
    return dashboards


def _save_dashboard(user:str, dashboard_data: Dashboard):

    # ########### DB OPERATIONS 
    db,client =_get_db_handle()

    res = db['dashboard'].insert_one({
                                      "ownerid":user, 
                                      "name":dashboard_data.name, 
                                      "trackedSymbols":dashboard_data.trackedSymbols,
                                      "unixTimestamp": dashboard_data.unixTimestamp
                                      })
    client.close()
    return res.inserted_id    