export interface IResponse {
    responseText?: string;
    bytesLoaded?: number;
    totalBytes?: number;
    previousBytes?: number;
    fromCache?: boolean;
}

export class Response {
    responseText: string;
    bytesLoaded: number;
    totalBytes: number;
    previousBytes: number;
    fromCache: boolean;
    constructor({
        responseText = '',
        fromCache = false
    }:IResponse) {
        this.responseText = responseText;
        this.fromCache = fromCache;
    }
}