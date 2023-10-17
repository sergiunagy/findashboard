import os 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.layers import Input, LSTM, Dense
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import SGD, Adam

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

import pandas as pd
import numpy as np

# config constants
STEPS_IN_FUTURE = 60    # we'll predict this far in the future: here, aprox 1h
T = 50                  # window size for time series prediction
D = 5                   # features per sample

# ########## DUMMY DATA
import requests
def _get_1_day_data_raw(sym:str='TSLA', start=1697447287, stop=1697540887):
    api='https://finnhub.io/api/v1/stock/candle'
    params = {
        'token':'ck47m71r01qus81pr1ogck47m71r01qus81pr1p0',
        'symbol':sym,
        'resolution':1,
        'from':start,
        'to':stop,
        'exchange':'US',
    }
    response = requests.get(api, params=params)

    return dict(response.json())

##################

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

# -----  Routers
# not yet required

def _get_data(source):
    
    datadf = pd.DataFrame.from_dict(source).rename(columns = {
    'c':'close',
    'h':'high',
    'l':'low',
    'o':'open',
    't':'timestamp',
    'v':'volume',
    's':'status'
    }).drop(['status'], axis=1).set_index('timestamp').sort_index() # remove irrelevant column and order by timestamp

    return datadf

def _shape_model_inputs(data):
    """
    Prepare data so it fits pre-trained model
    """
    Xtens = np.zeros((len(data), T, D))
    for t in range(len(data)-T):
        Xtens[t, :, :] = data[t:t+T]
    
    return Xtens[:-T] # truncate, last T are not populated. TODO Re-work this


def _predict(model, datain, for_steps=STEPS_IN_FUTURE):

    # set up the window - we only care about the last sequences i.e. what we use to predic in the future
    predictions=[] # empty predictions list. 
    datawindow = datain[-T:] # our last window in the received data. Startpoint for our multistep prediction

    while len(predictions) < for_steps:
        prediction = model.predict(datawindow[0].reshape((1,T,D)))
        predictions.append(prediction)

        datawindow = np.roll(datawindow, -1) # roll the tensor backwards 
        datawindow[-1] = prediction # overwrite the last entry with our prediction

    return predictions

# ------ APIs
@app.get("/test", tags=['testpoint'],
          summary='test service connection',
          description='reflects back request',
)
async def test():
 
    return 'Alive'


def _load_model():
    
    return tf.keras.models.load_model('model/lstm_predictor.keras')

@app.post("/api/v1/forecast", 
        tags=['forecast'], 
        summary='provide an hour return forecast for a time interval ',
        )
async def predict(symbol:str, start_time:int, end_time:int):

    model = _load_model()
    print('Loaded model:\n', model.summary())

    datarec = _get_data(_get_1_day_data_raw(symbol, start_time, end_time))
    
    # Validations check for nulls . TODO : proper validations and reactions
    print(f'Found {datarec.isnull().sum().sum()} null values')

    # normalize with pre-fitted scaler
    scaler = joblib.load('model/std_scaler.bin')
    normdata = scaler.transform(datarec)
    print('Configured data shape: ', normdata.shape)

    Xtens = _shape_model_inputs(normdata)
    print('Extracted timeries data shaped as (number of windows, size of window, features count): ', Xtens.shape)

    predictions = _predict(model, Xtens)

    returnval = lambda curr, prev : (curr - prev) / prev
    hourly_pred = returnval(predictions[-1].flatten()[0], predictions[-2].flatten()[0])
    
    return {'prediction':str(hourly_pred)}
