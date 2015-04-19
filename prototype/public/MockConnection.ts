import {IConnection, IConnectionBackend, IConnectionConfig} from './IConnection';
import {Methods} from './Methods';
import {ReadyStates} from './ReadyStates';
import {Request} from './Request';
import {Response} from './Response';
import Rx = require('rx');

/**
 * Connection represents a request and response for an underlying transport, like XHR or mock.
 * The mock implementation contains helper methods to respond to requests within tests.
 * API subject to change and expand.
 **/
export class Connection {
    /**
     * Observer to call on download progress, if provided in config.
     **/
    downloadObserver: Rx.Observer<Response>;
    method: Methods;
    /**
     * TODO
     * Name `readyState` should change to be more generic, and states could be made to be more
     * descriptive than XHR states.
     **/
    mockResponses: Rx.Subject<Response>;
    mockSends: Array<Request>;
    readyState: ReadyStates;
    request: Request;
    url: string;

    constructor(config) {
        if (!config.get('url')) throw new Error(`url is required to create a connection`);
        this.url = config.get('url');
        this.downloadObserver = config.get('downloadObserver');
        this.method = config.get('method');

        // State
        this.mockSends = [];
        this.mockResponses = new Rx.Subject<Response>();
        this.readyState = ReadyStates.OPEN;
        let connections = Backend.connections.get(this.url) || [];
        connections.push(this);
        Backend.connections.set(this.url, connections);
    }

    send(req: Request): Rx.Observable<Response> {
        this.mockSends.push(req);
        return this.mockResponses;
    }

    /**
     * Called after a connection has been established.
     **/
    mockRespond(res: Response) {
        this.readyState = ReadyStates.DONE;
        this.mockResponses.onNext(res);
        this.mockResponses.onCompleted();
    }

    mockDownload(res: Response) {
        this.downloadObserver.onNext(res);
        if (res.bytesLoaded === res.totalBytes) {
            this.downloadObserver.onCompleted();
        }
    }

    mockError(err?) {
        //Matches XHR semantics
        this.readyState = ReadyStates.DONE;
        this.mockResponses.onError(err);
        this.mockResponses.onCompleted();
    }
}

export class Backend {
    static connections: Map<string, Array<Connection>> = new Map<string, Array<Connection>>();

    static getConnectionByUrl(url: string): Array<Connection> {
        let connection = Backend.connections && Backend.connections.get(url);
        return connection || [];
    }

    static reset() {
        Backend.connections.clear();
    }

    static verifyNoPendingConnections() {
        Backend.connections.
            forEach(l => l.
                forEach(c => {
                    if (c.readyState !== 4) {
                        throw new Error(`Connection for ${c.url} has not been resolved`);
                    }
                }));
    }

    static createConnection(config: IConnectionConfig): Connection {
        return new Connection(config);
    }
}