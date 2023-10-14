import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString } from "class-validator";

export class UpdateDashboardDto {

    @IsNumber()
    id: number;

    @IsString()
    ownerid: string;

    @IsString()
    name:string;

    @IsArray()
    @IsString({each: true})
    @ArrayMinSize(1)
    trackedSymbols: string[];

    @IsNumber()
    unixTimestamp: number;
}