/**
 * Base entity model for Dashboards data.
 * Used to transport data betwee Service and Repository layers.
 */

import { AfterInsert, AfterRemove, AfterUpdate, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dashboard{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ownerid: string;

    @Column()
    name: string;

    @Column({
        transformer:{
            to(val){
                return JSON.stringify(val);
            },
            from(val){
                return JSON.parse(val);
            }
        }
    })
    trackedSymbols: string; /* store as comma separated strings */
 
    @Column()
    unixTimestamp: number;

    /* Set up some basic logging for the data editing ops. TODO add proper logger*/
    @AfterInsert()
    logInsert(){

        console.log(`Inserted new Dashboard with ID; ${this.id} and symbols: ${this.trackedSymbols}`);
    }

    @AfterUpdate()
    logUpdate(){
        console.log(`Updated new Dashboard with ID; ${this.id}`);
    }

    @AfterRemove()
    logDelete(){
        console.log(`Removed new Dashboard with ID; ${this.id}`);
    }

}