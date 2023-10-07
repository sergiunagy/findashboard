import json
from pymongo import MongoClient
from db.db import get_db_handle
from models.dashboard import Dashboard

def find_dashboard_by_owner_and_name(user:str, dashboard_name:str):
    """
    Return one dashboard for a given user-dashboard_name combination OR
    an empty object.
    """
    # ########### DB OPERATIONS 
    db,client = get_db_handle()
    print(user, dashboard_name)

    dashboard = db['dashboard'].find_one({"ownerid":user, "name":dashboard_name}, projection={"_id":0})

    client.close()

    return {'dashboard':dashboard}

def find_last_updated_dashboard_by_user(user):
    # ########### DB OPERATIONS 
    db, client =get_db_handle()

    dashboard = db["dashboard"].aggregate([
           {"$match": {"ownerid":user}}, 
           {"$sort": {"unixTimestamp": -1}},
           {"$limit": 1 },
           {"$unset":["_id", "ownerid"]}
        ]).next()

    client.close()
    return dashboard

def find_all_dashboards_by_user(user):
    # ########### DB OPERATIONS 
    db, client =get_db_handle()

    # simply convert to list here, no big data expected
    dashboards = list(db["dashboard"].find({"ownerid":user}, projection={"_id":0}))

    client.close()

    return dashboards

def save_dashboard(user:str, dashboard_data: Dashboard):
    # ########### DB OPERATIONS 
    db,client =get_db_handle()

    res = db['dashboard'].insert_one({
                                      "ownerid":user, 
                                      "name":dashboard_data.name, 
                                      "trackedSymbols":dashboard_data.trackedSymbols,
                                      "unixTimestamp": dashboard_data.unixTimestamp
                                      })
    client.close()
    return res.inserted_id    


def delete_dashboard_for_owner_and_name(user:str, dashboard_name:str):
    # ########### DB OPERATIONS 
    db,client = get_db_handle()
    print(user, dashboard_name)

    dashboard = db['dashboard'].delete_one({"ownerid":user, "name":dashboard_name})

    client.close()

    return {'dashboard':dashboard}