import json
import bson
from pymongo import MongoClient
from bson import ObjectId

from db.db import get_db_handle
from models.dashboard import Dashboard

def _oid_to_str(element):

    element['_id'] = str(element['_id'])
    return element

def find_dashboard_by_owner_and_name(user:str, dashboard_name:str):
    """
    Return one dashboard for a given user-dashboard_name combination OR
    an empty object.
    """
    # ########### DB OPERATIONS 
    db,client = get_db_handle()
    print(user, dashboard_name)

    dashboard = db['dashboard'].find_one({"ownerid":user, "name":dashboard_name})
    if dashboard:
       dashboard = _oid_to_str(dashboard)

    client.close()

    return {'dashboard':dashboard}

def find_last_updated_dashboard_by_user(user):
    # ########### DB OPERATIONS 
    db, client =get_db_handle()

    dashboard = db["dashboard"].aggregate([
           {"$match": {"ownerid":user}}, 
           {"$sort": {"unixTimestamp": -1}},
           {"$limit": 1 },
        #    {"$unset":["_id", "ownerid"]}
        ]).next()
    
    if dashboard:
       dashboard = _oid_to_str(dashboard)

    client.close()
    return dashboard

def find_all_dashboards_by_user(user):
    # ########### DB OPERATIONS 
    db, client =get_db_handle()
    # simply convert to list here, no big data expected 
    dashboards = list(db["dashboard"].find({"ownerid":user}))
    # return the oid as well => this needs converstion
    if dashboards:
       dashboards = list(map(_oid_to_str,dashboards))
            
    client.close()

    return dashboards

def new_dashboard(user:str, dashboard_data: Dashboard):
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
  
def update_dashboard(dashboard_id: str, updated_dashboard: Dashboard):
    # ########### DB OPERATIONS 
    db,client =get_db_handle()

    res = db['dashboard'].update_one({
                                      "ownerid":user, 
                                      "name":dashboard_data.name, 
                                      "trackedSymbols":dashboard_data.trackedSymbols,
                                      "unixTimestamp": dashboard_data.unixTimestamp
                                      })
    client.close()
    return res.inserted_id    


def delete_dashboard_by_id(did: str):
    # ########### DB OPERATIONS 
    db,client = get_db_handle()

    try:
        deleted = db['dashboard'].delete_one({"_id":ObjectId(did)})

    except bson.errors.InvalidId as err:
        deleted = {False}

    client.close()

    return deleted.deleted_count == 1