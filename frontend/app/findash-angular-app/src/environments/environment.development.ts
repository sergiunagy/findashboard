export const environment = {
    production: false,
    backendurl: "http://localhost:8090",
    
    /* DASHBOARDS SERVICE API */
    api_dashboards : "/api/v1/dashboards",                    /*POST, PUT, GET, DELETE*/
    api_find_by : "/api/v1/dashboards/find",         /*GET*/
    
    /* DATA SERVICE API */
    api_getcandle : "/findata/api/v1/stock/candle",
    api_findsymbols : "/findata/api/v1/stock/symbol",

    /* AUTH SERVICE API */
    api_signin : "/api/v1/auth/signin",

    /* Forecasting SERVICE API */
    api_forecast : "/api/v1/forecast",

};
