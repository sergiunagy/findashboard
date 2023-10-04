import os 
from typing import Optional
from fastapi import FastAPI, Response, status, APIRouter
from fastapi.responses import Response, HTMLResponse, PlainTextResponse
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware

# ------- DB stuff
# from db import models
# from db.database import engine

API_KEY = os.environ.get('FINNHUB_APIKEY', None)
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

################# Dummy data - TODO: proper auth is currently out of scope. Add this later
DUMMY_TOKEN = '1234' # TODO: generate proper JWT if required

dummy_response_with_api_key ={ 
        'user_alias' :'demo-user-alias', 
        'token_type':'bearer',
        'access_token' :DUMMY_TOKEN,
        'expires_in': '3600',
        'finnhub-api-key': API_KEY,
        }

# -----  Routers
# not yet required

# ------ APIs
@app.post("/api/v1/auth/signin", tags=['signin'],
          summary='authentication API with user credentials.',
          description='Incomplete. Always returns auth ok. Credentials not checked.',
)
async def signin():
    # TODO: implement actual auth

    # proper JWT header
    response_header = {
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
        }
    return dummy_response_with_api_key, 200, response_header

