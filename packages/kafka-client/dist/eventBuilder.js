import { v4 as uuidv4 } from "uuid";
export function createEvent(type, payload, version = 1) {
    return {
        eventId: uuidv4(),
        type,
        version,
        payload,
        timestamp: new Date().toISOString(),
    };
}
