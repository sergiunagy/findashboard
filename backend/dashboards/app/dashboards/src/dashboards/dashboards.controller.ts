import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { CreateDashboardDto } from './dtos/create-dashboard.dto';
import { DashboardsService } from './dashboards.service';
import { Dashboard } from 'src/model/dashboard.entity';
import { CreateDashboardParams } from './dtos/create-dashboard.param';
import { FindAllByParams } from './dtos/find-all-by.params';
import { FindDashboardParams } from './dtos/find-dashboard.params';
import { UpdateDashboardDto } from './dtos/update-dashboard.dto';

@Controller('/api/v1/dashboards')
export class DashboardsController {

    constructor(private service: DashboardsService){}

    @Post()
    createDashboard(@Query() ownerId: CreateDashboardParams, 
                    @Body() body: CreateDashboardDto){
        
        return this.service.create(ownerId.ownerId, body);
    }

    @Put()
    updateDashboard(@Body() body: UpdateDashboardDto){
        
        return this.service.updateOne(body);
    }

    @Get()
    findDashboardsBy(@Query() query?:FindAllByParams){
        /* send  */
        return this.service.findBy(query);
    }

    @Get("find")
    findDashboard(@Query() id:FindDashboardParams){

        return this.service.findOne(id.dashboardId);
    }

    @Delete()
    removeDashboard(@Query() id:FindDashboardParams){

        return this.service.deleteOne(id.dashboardId);
    }
}
