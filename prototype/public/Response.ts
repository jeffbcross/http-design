export interface IResponse {
    responseText: string;
    bytesLoaded?: number;
    totalBytes?: number;
    previousBytes?: number;
}

export class Response {
    bytesLoaded: number;
    totalBytes: number;
    previousBytes: number;
    constructor(public responseText?: string) {
        this.responseText = responseText;
    }
}