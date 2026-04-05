import {v4 as uuidv4} from "uuid";

export interface StandardEvent<T>{
    eventId : string,
    type : string,
    version : number,
    payload : T,
    timestamp : string,
}

export function createEvent<T>(type:string,payload:T,version:number=1){
    return{
        eventId : uuidv4(),
        type,
        version,
        payload,
        timestamp : new Date().toISOString(),
    }
}