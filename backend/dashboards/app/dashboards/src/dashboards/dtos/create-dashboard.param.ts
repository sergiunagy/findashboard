import { IsNotEmpty, IsString } from "class-validator";

export class CreateDashboardParams {

    @IsString()
    @IsNotEmpty()
    ownerId: string;
}