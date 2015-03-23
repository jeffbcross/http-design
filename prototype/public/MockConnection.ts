import {Response} from './Response';
import {IConnectionConfig} from './BaseConnectionConfig';
import {ReadyStates} from './ReadyStates';
import {IConnection, IConnectionBackend} from './IConnection';

export class Connection {
    readyState: number;
    url: string;
    method: string;
    downloadObserver: Rx.Observer<Response>;
    constructor(public observer: Rx.IObserver<Response>, config: IConnectionConfig) {
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
    static getConnectionByUrl(url: string): Connection {
        if (!Backend.connections) {
            return null;
        }

        return Backend.connections.get(url) || null;
    }

    static reset() {
        Backend.connections.clear();
    }

    static verifyNoPendingConnections() {
        Backend.connections.forEach((c) => {
            if (c.readyState !== 4) {
                throw new Error(`Connection for ${c.url} has not been resolved`);
            }
        });
    }

    static createConnection(observer: Rx.IObserver<Response>, config: IConnectionConfig): Connection {
        return new Connection(observer, config);
    }
}