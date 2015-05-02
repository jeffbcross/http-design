export interface IResponse {
    responseText?: string;
    bytesLoaded?: number;
    totalBytes?: number;
    previousBytes?: number;
    fromCache?: boolean;
    type?: string; //TODO: enum based on https://fetch.spec.whatwg.org/#responses
    statusCode?: number;
}

export class Response {
    responseText: string;
    bytesLoaded: number;
    totalBytes: number;
    previousBytes: number;
    fromCache: boolean;
    type: string;
    statusCode: number;
    constructor({
        responseText = '',
        fromCache = false,
        statusCode
    }:IResponse) {
        this.responseText = responseText;
        this.fromCache = fromCache;
        this.statusCode = statusCode;
    }
}