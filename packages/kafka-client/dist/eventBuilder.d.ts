export interface StandardEvent<T> {
    eventId: string;
    type: string;
    version: number;
    payload: T;
    timestamp: string;
}
export declare function createEvent<T>(type: string, payload: T, version?: number): {
    eventId: string;
    type: string;
    version: number;
    payload: T;
    timestamp: string;
};
