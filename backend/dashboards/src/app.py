import os 
from typing import Optional
from fastapi import FastAPI, Request, Response, status, APIRouter
# from fastapi.responses import Response, HTMLResponse, PlainTextResponse

from fastapi.middleware.cors import CORSMiddleware

from models.dashboard import Dashboard
# from client import html
# ------- DB stuff
# from db import models
# from db.database import engine
import libs.dashboards as dashb

FRONTEND_HOST = os.environ.get('FRONTEND_HOST', None)

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
@app.get("/api/v1/dashboards/test")
def test_point():

    return "Test-OK"

@app.get("/api/v1/dashboards/load", 
        tags=['dashboards'], 
        summary='retrieve a dashboard configuration',
        description=f'Returns a Dashboard profile given a user/owner and a dashboard name',
        )
async def find_dashboard_for_user_and_name(user: str, dashboard_name:str):

    dashboard = dashb.find_dashboard_by_owner_and_name(user, dashboard_name)
    
    return dashboard


@app.get("/api/v1/dashboards/loadlast", 
        tags=['dashboards'], 
        summary='retrieve last dashboard configuration for user',
        )
async def find_last_updated_dashboard_for_user(user: str):

    last_updated_dashboard = dashb.find_last_updated_dashboard_by_user(user)
    
    return {'dashboard': last_updated_dashboard}


@app.get("/api/v1/dashboards/findall", 
        tags=['dashboards'], 
        summary='retrieve all dashboard configurations given a user',
        )
async def find_all_dashboards_for_user(user: str):

    last_updated_dashboard =dashb.find_all_dashboards_by_user(user)
    
    return last_updated_dashboard


@app.post("/api/v1/dashboards/new", 
        tags=['dashboards'], 
        summary='add a new dashboard configuration',
        description=f'Creates a new Dashboard profile associate to the user',
        )
async def new_dashboard(user: str , dashboard:Dashboard):

    created_id  = dashb.new_dashboard(user, dashboard) 
    return {created_id is not None}


@app.put("/api/v1/dashboards/update", 
        tags=['dashboards'], 
        summary='update a dashboard configuration',
        description=f'Stores a Dashboard profile given',
        )
async def update_dashboard(dashboard_id:str):

    
    return {"Not Implemented"}

@app.delete("/api/v1/dashboards/delete", 
        tags=['dashboards'], 
        summary='delete a users dashboard configuration by name ',
        )
async def delete_dashboard(dashboard_id: str):

    deleted  = dashb.delete_dashboard_by_id(dashboard_id) 
    return deleted
    

