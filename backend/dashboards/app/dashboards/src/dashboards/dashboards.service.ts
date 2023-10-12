import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from 'src/model/dashboard.entity';
import { MissingDeleteDateColumnError, Repository } from 'typeorm';
import { CreateDashboardDto } from './dtos/create-dashboard.dto';
import { UpdateDashboardDto } from './dtos/update-dashboard.dto';

@Injectable()
export class DashboardsService {

    constructor(@InjectRepository(Dashboard) private repo: Repository<Dashboard>){}

    create(ownerid:string, dashdata: CreateDashboardDto): Promise<Dashboard>{

        const dashboard= new Dashboard();
        Object.assign(dashboard, {ownerid, ...dashdata});

        const created = this.repo.create(dashboard);

        return this.repo.save(created);
    }

    async findBy(query:{ownerid?:string, name?:string}): Promise<Dashboard[]>{

        return this.repo.findBy(query);
    }


    findOne(id: number): Promise<Dashboard | null>{

        return this.repo.findOneBy({id});
    }

    async updateOne(updatedDashboard: UpdateDashboardDto):Promise<Dashboard | null>{

        const dashboard = await this.findOne(updatedDashboard.id);

        if(!dashboard){
            throw new NotFoundException(`Dashboard with id ${updatedDashboard.id} does not exist`);
        }

        Object.assign(dashboard, updatedDashboard);

        return this.repo.save(dashboard);
    }


    async deleteOne(id: number):Promise<Dashboard>{

        const dashboard = await this.findOne(id);

        if(!dashboard){ /* Return an error if ID is not found, anomaly event though this is a delete */
            throw new NotFoundException(`Dashboard with id ${id} does not exist`);
        }

        return this.repo.remove(dashboard);
    }
    
}
