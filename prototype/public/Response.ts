export interface IResponse {
    responseText?: string;
    bytesLoaded?: number;
    totalBytes?: number;
    previousBytes?: number;
    fromCache?: boolean;
    type?: string; //TODO: enum based on https://fetch.spec.whatwg.org/#responses
}

export class Response {
    responseText: string;
    bytesLoaded: number;
    totalBytes: number;
    previousBytes: number;
    fromCache: boolean;
    type: string;
    constructor({
        responseText = '',
        fromCache = false
    }:IResponse) {
        this.responseText = responseText;
        this.fromCache = fromCache;
    }
}