# Forecasting

- see Colab notebook for analysis details and code : https://colab.research.google.com/drive/1fu2YAWgXiQyEkUHabxrSh73BV5gjpMFk#scrollTo=JqNoUw0OGx3u&uniqifier=1

## General points

### Model integration
We will use a suitable Time Series model that will export the predictions in a specific format.\
This is so we can switch the model based on performance.

### Model training

We cannot find a free model pre-trained on the specific data we have. \
To train a model from scratch we will pull data from the finnhub provider for the max available time interval.\
We will only use 10 stocks as a proof-of concept. Doing all the available stocks is a simple extension of the concept but it would result in much larger training datasets and necessary time.

## Model type

We will start with a generic LSTM model. \
At a second stage, the model can be exchange for more powerfull Transformer based models or model compositions.


# Data and training

## Available data shape

We use the candle data api which provides as follows, given a time interval and a resolution for the data sampling.

Given:
- interval = [startTimestamp, endTimestamp]
- resolution = 1 min (max supported resolution for the api). i.e they sample data from the stock markets at this sampling rate

We receive the following structure:
- 'o' - opening value at the start of the candle interval
- 'h' - highest value observed during the candle interval
- 'l' - lowest value observed during the candle interval
- 'c' - closing value for the candle interval
- 'v' - volume of transacted stocks during the interval
- 't' - timestamp as a unixTimestamp (see https://www.unixtimestamp.com/) for the sampled values

## Dataset construct

We will define the module predictions as a vector of closing prices for a given moment in time : C(t).

We will define the features vector as a sample vector of received data (including the closing prices) for t-1: S(t-1).

We will have a time series prediction, meaning our model will attempt to predict the C for the next candle.

We will also use only 10 stocks for the predictions. This means our C vector will be shaped as [10 x 1].

Our input data matrix will be shaped like [N x M x 1] where:
- N is the number of samples we will pull from the finnhub as training data
- M is the size of one sample vector. To simplify the concept we will concatenate the candle vectors from all the stocks, i.e. for 3 stocks A, B, C we would have sample = [oa, ha, la, va, ca.., lc, vc, t]
Note the following:
    - t is taken only once since t should be common for all stocks
    - c values are also included. This makes sense in the context of a timeseries where past values are predictors for current values. This also explains the decrease in accuracy as we predict further into the future as the errors accrued at each step will accumulate.
- 1 is the sample size for each symbol but since we concatenate all, this will be 1.


In short we will have the following:

[ca(t), cb(t), cc(t) ] = f(sample(t-1)). where sample(t-1) also contains ca(t-1), cb(t-1), cc(t-1).

## Challenges

### Different sample times for the different stocks
Filling missing data with suitable values (ex. gaps in sampled data for a single stock).\
We can observe the data is not synchronized over the stocks, i.e. note the varied sizes of data pulled for the same time intervals:
![Alt text](readmeimgs/data_diff.png)

Testing if the timestamps are unique shows this is true:
![Alt text](readmeimgs/timestamps_unique.png)


### Solution

A quick solution is to normalize the timestamp values (set a step size) and fill in any missing values with the last values (from the previous sampling).

To do this we will use merge sorting over the timestamp value sets to construct a complete set (unique values) of timestamps.
Note:
 - merge sorting is O (nlogn) and it seems most python libraries provide a sort with this performance. We'll take numpy since it will be used later as well. Numpy requires a concatenation (O(1)) followed by a sort (O(nlogn))

### Data gaps analysis

We see that step sizes are irregular over the merged timestamp vector:
![Alt text](readmeimgs/time_steps.png)

Analysis shows the following.
We see that data gaps appear in 2 situations:
- 8h gaps: daily between 24.00 and 8.00 the next day
- 56h gaps: over each weekend from Friday 24:00 to Monday 8.00
- 120s and 180s: Smaller gaps are simply intervals where no data was sampled (constant data) for any of the monitored stocks.

Example for the 56h gap:
![Alt text](readmeimgs/56hgap.png)

#### Solution
Since these gaps are across all stocks we can simply consider the data within these intervals as constant.
An alternative to explore would be to cut out these intervals completely .