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
FRONTEND_HOST_DEV = os.environ.get('FRONTEND_HOST_DEV', None)

app = FastAPI()
# set up CORS for same-machine access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_HOST, FRONTEND_HOST_DEV],        # same domain in case of testing
    allow_credentials=True,             # allow cookies and credentials
    allow_methods = ['*'],              # all methods
    allow_headers = ['*']               # all headers
)

################# Dummy data - TODO: proper auth is currently out of scope. Add this later
DUMMY_TOKEN = '1234' # TODO: generate proper JWT if required

dummy_user_profile = {
        'id': '01865b6c51f04ba8a8b5ecc699fc51ec',
        'alias' :'user-alias', 
        'name' :'Anonymous',
}

dummy_response_with_api_key ={
        'user' : dummy_user_profile,
        'token_type':'bearer',
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

    return dummy_response_with_api_key

