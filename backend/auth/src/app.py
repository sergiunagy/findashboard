import os 
from typing import Optional
from fastapi import FastAPI, Response, status, APIRouter
from fastapi.responses import Response, HTMLResponse, PlainTextResponse
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware

# from client import html
# ------- DB stuff
# from db import models
# from db.database import engine

import time
API_KEY = os.environ.get('FINNHUB_APIKEY', None)

app = FastAPI()
# set up CORS for same-machine access
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:8000'],        # same domain in case of testing
    allow_credentials=True,             # allow cookies and credentials
    allow_methods = ['*'],              # all methods
    allow_headers = ['*']               # all headers
)

################# Dummy data
dummy_token = '1234'
# dummy_access_jwt = {
#         'header': {
#             'Content-Type':'application/x-www-form-urlencoded',
#         },
#         'body'={
#             'username':'refresh_token',
#             'password': 'whateva',
#             'grant_type': 'password'
#             }

# }
dummy_response_with_api_key ={ 
        'user_alias' :'demo-user-alias', 
        'token_type':'bearer',
        'access_token' :dummy_token,
        'expires_in': '3600',
        'finnhub-api-key': API_KEY,
        }


# -----  Routers

# ------ APIs
# websockets
wsclients = []

@app.post("/api/v1/auth/signin", tags=['signin'])
async def signin():
    response_header = {
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
        }
    return dummy_response_with_api_key, 200, response_header

