declare var require;

import {IConnection, IConnectionBackend, IConnectionConfig} from './IConnection';
import {Methods} from './Methods';
import {ReadyStates} from './ReadyStates';
import {Request} from './Request';
import {Response} from './Response';
import Rx = require('rx');

var di = require('di');

/**
 * Connection represents a request and response for an underlying transport, like XHR or mock.
 * The mock implementation contains helper methods to respond to connections within tests.
 * API subject to change and expand.
 **/
export function ConnectionFactory (backend) {
    return function () {
        let connection = new Connection(backend);
        backend.connections.push(connection);
        return connection;
    }
}

export class Connection {
    /**
     * Observer to call on download progress, if provided in config.
     **/
    downloadObserver: Rx.Observer<Response>;

    /**
     * TODO
     * Name `readyState` should change to be more generic, and states could be made to be more
     * descriptive than XHR states.
     **/

    readyState: ReadyStates;
    backend: Backend;
    request: Request;
    response: Rx.ReplaySubject<Response>;

    constructor(req: Request) {
        // State
        this.response = new Rx.ReplaySubject<Response>();
        this.readyState = ReadyStates.OPEN;
        this.request = req;
    }

    send(): Rx.ReplaySubject<Response> {
        return this.response;
    }

    /**
     * Called after a connection has been established.
     **/
    mockRespond(res: Response) {
        this.readyState = ReadyStates.DONE;
        this.response.onNext(res);
        this.response.onCompleted();
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
        this.response.onError(err);
        this.response.onCompleted();
    }
}



export class Backend {
    connections: Rx.ReplaySubject<Connection>;
    pendingConnections: Rx.Observable<Connection>;
    constructor() {
        this.connections = new Rx.ReplaySubject<Connection>();
        this.pendingConnections = this.connections.filter((c) => c.readyState !== 4)
    }

    verifyNoPendingRequests() {

    }

    createConnection (req: Request) {
        if (!req || !(req instanceof Request)) {
            throw new Error(`createConnection requires an instance of Request, got ${req}`);
        }
        let connection = new Connection(req);
        this.connections.onNext(connection);
        return connection;
    }
}

di.annotate(ConnectionFactory, new di.Inject(Backend));
