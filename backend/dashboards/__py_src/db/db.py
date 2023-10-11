from pymongo import MongoClient

MONGODB_SERVER_PORT=27017
MONGODB_BACKEND = 'mongodb://findemoadmin:findemoadmin_pas_951@datastore-server:27017'
DATABASE = 'dashboards'

def get_db_handle():
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
