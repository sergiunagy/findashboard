/**
 * Dashboard configuration data model
 */

import * as moment from "moment";

export interface DashboardConfig {
    id: string;
    ownerid: string;
    name: string;
    trackedSymbols: string[];
    unixTimestamp: number;
  }