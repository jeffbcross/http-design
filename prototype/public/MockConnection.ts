import {Request} from './Request';
import {Response} from './Response';
import {IConnectionConfig} from './BaseConnectionConfig';
import {ReadyStates} from './ReadyStates';
import {IConnection, IConnectionBackend} from './IConnection';

export class Connection {
    readyState: number;
    url: string;
    method: string;
    downloadObserver: Rx.Observer<Response>;
    mockSends: Array<string>;
    request: Request;
    constructor(public observer: Rx.IObserver<Response>, config: IConnectionConfig) {
        var { url, downloadObserver, method } = config;
        this.url = url;
        this.readyState = ReadyStates.OPEN;
        this.downloadObserver = downloadObserver;
        let connections = Backend.connections.get(url) || [];
        connections.push(this);
        Backend.connections.set(url, connections);
        this.mockSends = [];
        this.request = new Request(url);
    }

    send(data?:string) {
        this.mockSends.push(data);
    }

    mockRespond(res: Response) {
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
    static connections: Map<string, Array<Connection>> = new Map<string, Array<Connection>>();

    constructor() {

    }
    static getConnectionByUrl(url: string): Array<Connection> {
        let connection = Backend.connections && Backend.connections.get(url);
        return connection || [];
    }

    static reset() {
        Backend.connections.clear();
    }

    static verifyNoPendingConnections() {
        Backend.connections.forEach((l) => {
            l.forEach((c) => {
                if (c.readyState !== 4) {
                    throw new Error(`Connection for ${c.url} has not been resolved`);
                }
            });
        });
    }

    static createConnection(observer: Rx.IObserver<Response>, config: IConnectionConfig): Connection {
        return new Connection(observer, config);
    }
}