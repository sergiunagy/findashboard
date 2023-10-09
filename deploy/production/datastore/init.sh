#! /usr/bin/env bash
echo "################## SEEDING THE DATABASE #################"

echo " -- SEEDING THE TEST USERS --"
mongoimport \
            --db users \
            --collection='user' \
            --drop \
            --file='/database-seed/users.dbseed' \
            --jsonArray

echo " -- SEEDING THE SAMPLE DASHBOARD --"
mongoimport \
            --db dashboards \
            --collection='dashboard' \
            --drop \
            --file='/database-seed/dashboards.dbseed' \
            --jsonArray

