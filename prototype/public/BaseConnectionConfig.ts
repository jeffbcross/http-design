import {Response} from './Response';
import {Methods} from './Methods';

export interface IConnectionConfig {
    url: string;
    method?: string;
    cold?: boolean;
    downloadObserver?: Rx.Observer<Response>;
    uploadObserver?: Rx.Observer<any>;
    stateObserver?: Rx.Observer<any>;
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
    cold: boolean;
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<any>;
    stateObserver: Rx.Observer<any>;

    constructor(source?: IConnectionConfig) {
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