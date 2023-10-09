export const environment = {
    production: true,

    backendurl: "http://localhost:8090",
    
    /* DASHBOARDS SERVICE API */
    api_newdashboard : "/api/v1/dashboards/new",
    api_updatedashboard : "/api/v1/dashboards/update",
    api_loadlastdashboard : "/api/v1/dashboards/loadlast",
    api_findalldashboards : "/api/v1/dashboards/findall",
    api_deletedashboard : "/api/v1/dashboards/delete",
    api_loaddasboardbyname : "/api/v1/dashboards/load",
    
    /* DATA SERVICE API */
    api_getcandle : "/findata/api/v1/stock/candle",
    api_findsymbols : "/findata/api/v1/stock/symbol",

    /* AUTH SERVICE API */
    api_signin : "/api/v1/auth/signins",
};
