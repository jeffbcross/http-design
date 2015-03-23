/// <reference path="bower_components/immutable/dist/immutable.d.ts" />
/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
/// <reference path="BaseConnectionConfig.ts" />
import Immutable = require('immutable');
import Rx = require('rx');

export class Request {

}

export class State {

}

export const Methods = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};

export interface IConnectionConfig {
    url: string;
    method?: string;
    cold?: boolean;
    downloadObserver?: Rx.Observer<Response>;
    uploadObserver?: Rx.Observer<Request>;
    stateObserver?: Rx.Observer<State>;
}

export class ConnectionConfig implements IConnectionConfig{
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<Request>;
    stateObserver: Rx.Observer<State>;
    constructor(public method?:string, public url?:string) {

    }
}

export class BaseConnectionConfig implements IConnectionConfig {
    method: string;
    url: string;
    cold: boolean;
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<Request>;
    stateObserver: Rx.Observer<State>;

    constructor (source?: IConnectionConfig) {
        this.method = (source && source.method) || Methods.GET;
        this.url = (source && source.url) || null;
        this.downloadObserver = (source && source.downloadObserver) || null;
        this.uploadObserver = (source && source.uploadObserver) || null;
        this.stateObserver = (source && source.stateObserver) || null;
        this.cold = (source && source.cold) || false;

        Object.freeze(this);
    }

    merge(source: IConnectionConfig): BaseConnectionConfig {
        return new BaseConnectionConfig(source);
    }
}

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
    constructor(public responseText?:string) {
        this.responseText = responseText;
    }

    //getLatestChunk ():string {
    //    return this.responseText.slice(this.previousBytes) || '';
    //}
}

const ReadyStates = {
    UNSENT: 0,
    OPEN: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
};

export class Connection {
    readyState: number;
    url: string;
    method: string;
    downloadObserver:Rx.Observer<Response>;
    constructor(public observer:Rx.IObserver<Response>, config:IConnectionConfig) {
        var { url, downloadObserver, method } = config;
        this.url = url;
        this.readyState = ReadyStates.OPEN;
        this.downloadObserver = downloadObserver;
        Backend.connections.set(url, this);
    }

    send() {
    }

    mockRespond(res: Response) {
        //TODO: support progressive responding
        this.readyState = ReadyStates.DONE;
        this.observer.onNext(res);
    }

    mockDownload(res: Response) {
        this.downloadObserver.onNext(res);
        if (res.bytesLoaded === res.totalBytes) {
            this.downloadObserver.onCompleted();
        }
    }
}

export class Backend {
    static connections: Map<string, Connection> = new Map<string, Connection>();

    constructor() {

    }
    static getConnectionByUrl(url: string):Connection {
        if (!Backend.connections) {
            return null;
        }

        return Backend.connections.get(url) || null;
    }

    static reset () {
        Backend.connections.clear();
    }

    static verifyNoPendingConnections () {
        Backend.connections.forEach((c) => {
            if (c.readyState !== 4) {
                throw new Error(`Connection for ${c.url} has not been resolved`);
            }
        });
    }

    static createConnection(observer:Rx.IObserver<Response>, config:IConnectionConfig): Connection {
        return new Connection(observer, config);
    }
}
//Backend.connections = new Map<string,Connection>();

export function http(config: string|IConnectionConfig) {
    let baseConnection = new BaseConnectionConfig();
    let connectionConfig = baseConnection.merge(
        typeof config === 'string' ?
            new ConnectionConfig('get', config) :
            config
        )

    let observable = Rx.Observable.create((observer) => {
        let connection = Backend.createConnection(observer, connectionConfig);
        connection.send();
    });

    if (!connectionConfig.cold) {
        let connectable = observable.publish();
        connectable.connect();
    }

    return observable;
}
