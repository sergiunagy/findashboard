/**
 * Dashboard configuration data model
 */

import * as moment from "moment";

export interface DashboardConfig {
    id: string;
    name: string;
    trackedSymbols: string[];
    unixTimestamp: number;
  }