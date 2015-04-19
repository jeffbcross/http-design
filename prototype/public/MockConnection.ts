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
 * The mock implementation contains helper methods to respond to requests within tests.
 * API subject to change and expand.
 **/
export function ConnectionFactory (backend) {
    return function () {
        return new Connection(backend);
    }
}

class Connection {
    /**
     * Observer to call on download progress, if provided in config.
     **/
    downloadObserver: Rx.Observer<Response>;

    /**
     * TODO
     * Name `readyState` should change to be more generic, and states could be made to be more
     * descriptive than XHR states.
     **/
    mockResponses: Rx.Subject<Response>;
    mockSends: Array<Request>;
    readyState: ReadyStates;
    backend: Backend;

    constructor(backend:Backend) {
        // State
        this.mockSends = [];
        this.mockResponses = new Rx.Subject<Response>();
        this.readyState = ReadyStates.OPEN;
        this.backend = backend;
    }

    send(req: Request): Rx.Observable<Response> {
        this.mockSends.push(req);
        let requests = this.backend.requests.get(req.url) || [];
        requests.push(this);
        this.backend.requests.set(req.url, requests);
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
    requests: Map<string, Array<Connection>>;
    constructor() {
        this.requests = new Map<string, Array<Connection>>();
    }

    getConnectionByUrl(url: string): Array<Connection> {
        let connection = this.requests && this.requests.get(url);
        return connection || [];
    }

    reset() {
        this.requests.clear();
    }

    verifyNoPendingRequests() {
        this.requests.
            forEach(l => l.
                forEach(c => {
                    if (c.readyState !== 4) {
                        throw new Error(`Connection has not been resolved`);
                    }
                }));
    }
}

di.annotate(ConnectionFactory, new di.Inject(Backend));
