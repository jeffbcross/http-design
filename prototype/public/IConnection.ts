/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
import {Response} from './Response';
import {Request} from './Request';
import {Methods} from './Methods';

export interface IConnectionBackend {
    createConnection(observer: Rx.Observer<Response>, config: IConnectionConfig): IConnection;
}

export interface IConnection {
    readyState: number;
    url: string;
    send(): void;
}

export interface IConnectionConfig {
    /**
     * Connections require a url when executed, but not required in interface because shared
     * connection configurations, such as BaseConnectionConfig may not have a url.
     **/
    url?: string;
    method?: Methods;
    downloadObserver?: Rx.Observer<Response>;
    uploadObserver?: Rx.Observer<any>;
    stateObserver?: Rx.Observer<any>;
    //                         TypeScript Hack        Typescript Hack
    cacheSetter?: (req: Request|Response, res: Response|Request) => any;
    cacheGetter?: (req: Rx.Observable<Request>) => Rx.Observable<Response>;
    requestTransformer?: (req: Rx.Observable<Request>) => Rx.Observable<Request>;
    responseTransformer?: (res: Rx.Observable<Response>) => Rx.Observable<Response>;
}