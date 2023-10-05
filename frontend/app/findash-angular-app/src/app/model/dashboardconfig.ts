import * as moment from "moment";

export interface DashboardConfig {
    name: string;
    trackedSymbols: string[];
    unixTimestamp: number;
  }