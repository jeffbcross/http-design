import {Request} from './Request';
import {Response} from './Response';
import {Methods} from './Methods';

export interface IConnectionConfig {
    url?: string;
    method?: string;
    cold?: boolean;
    downloadObserver?: Rx.Observer<Response>;
    uploadObserver?: Rx.Observer<any>;
    stateObserver?: Rx.Observer<any>;
    requestTransforms?: Array<(req: Request) => Request>;
    responseTransforms?: Array<(res: Response) => Response>;
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
    requestTransforms: Array<(req:Request) => Request>;
    responseTransforms: Array<(res: Response) => Response>;

    constructor ({
        method = Methods.GET,
        url = null,
        downloadObserver = null,
        uploadObserver = null,
        stateObserver = null,
        cold = false,
        requestTransforms = [],
        responseTransforms = []
    }: IConnectionConfig) {
        this.method = method;
        this.url = url;
        this.downloadObserver = downloadObserver;
        this.uploadObserver = uploadObserver;
        this.stateObserver = stateObserver;
        this.cold = cold;
        this.requestTransforms = requestTransforms;
        this.responseTransforms = responseTransforms;

        Object.freeze(this);
    }

    merge(source: IConnectionConfig): BaseConnectionConfig {
        return new BaseConnectionConfig(source);
    }
}