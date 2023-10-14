import { IsOptional, IsString } from "class-validator";

export class FindAllByParams{

    @IsString()
    ownerid: string; /* Users can only query their own dashboards */

    @IsString()
    @IsOptional()
    name: string;   
}