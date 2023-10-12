import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindDashboardParams{

    @IsNumber()
    dashboardid: number; 
}