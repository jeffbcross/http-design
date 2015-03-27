import {Request} from './Request';
import {Response} from './Response';
import {Methods} from './Methods';
import Rx = require('rx');

export interface IConnectionConfig {
    url?: string;
    method?: string;
    downloadObserver?: Rx.Observer<Response>;
    uploadObserver?: Rx.Observer<any>;
    stateObserver?: Rx.Observer<any>;
    requestTransformer?: (req: Rx.Observable<Request>) => Rx.Observable<Request>;
    responseTransformer?: (res: Rx.Observable<Response>) => Rx.Observable<Response>;
}

export class ConnectionConfig implements IConnectionConfig {
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<any>;
    stateObserver: Rx.Observer<any>;
    constructor(public method?: string, public url?: string) {

    }
}

export class BaseConnectionConfig implements IConnectionConfig {
    method: string;
    url: string;
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<any>;
    stateObserver: Rx.Observer<any>;
    requestTransformer: (req: Rx.Observable<Request>) => Rx.Observable<Request>;
    responseTransformer: (res: Rx.Observable<Response>) => Rx.Observable<Response>;

    constructor ({
        method = Methods.GET,
        url = null,
        downloadObserver = null,
        uploadObserver = null,
        stateObserver = null,
        requestTransformer = (req) => {return req},
        responseTransformer = (res) => { return res}
    }: IConnectionConfig) {
        this.method = method;
        this.url = url;
        this.downloadObserver = downloadObserver;
        this.uploadObserver = uploadObserver;
        this.stateObserver = stateObserver;
        this.requestTransformer = requestTransformer;
        this.responseTransformer = responseTransformer;

        Object.freeze(this);
    }

    merge(source: IConnectionConfig): BaseConnectionConfig {
        return new BaseConnectionConfig(source);
    }
}