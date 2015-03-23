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
    method: string;
    url: string;
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
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<Request>;
    stateObserver: Rx.Observer<State>;

    constructor (source?: IConnectionConfig) {
        this.method = (source && source.method) || Methods.GET;
        this.url = (source && source.url) || null;
        this.downloadObserver = (source && source.downloadObserver) || null;
        this.uploadObserver = (source && source.uploadObserver) || null;
        this.stateObserver = (source && source.stateObserver) || null;

        Object.freeze(this);
    }

    merge (source:IConnectionConfig):BaseConnectionConfig {
        return new BaseConnectionConfig(source);
    }
}

export class IResponse {
    responseText: string;
}

export class Response {
    responseText: string;
    constructor({responseText}:IResponse) {
        this.responseText = responseText;
    }

    //getLatestChunk ():string {
    //    return this.responseText.slice(this.previousBytes) || '';
    //}
}

export class Connection {
    readyState: number;
    url: string;
    constructor(public observer:Rx.IObserver<Response>) {
        this.url = null;
        this.readyState = 0;
    }

    open(method: string, url: string): void {
        this.url = url;
        Backend.connections.set(url, this);
    }

    send() {

    }

    mockRespond(res: Response) {
        this.readyState = 4;
        this.observer.onNext(res);
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
        Backend.connections.forEach(function(c) {
            if (c.readyState !== 4) {
                throw new Error(`Connection for ${c.url} has not been resolved`);
            }
        });
    }

    static createConnection(observer:Rx.IObserver<Response>): Connection {
        return new Connection(observer);
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

    return Rx.Observable.create(function(observer) {
        let connection = Backend.createConnection(observer);
        connection.open(connectionConfig.method, connectionConfig.url);
        connection.send();
    });
}
