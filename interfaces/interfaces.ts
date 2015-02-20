/// <reference path="immutable.d.ts" />
/// <reference path="rx-lite.d.ts" />

class XHRConnection {
  response: Rx.Observable<IResponse>;
  uploadProgress: Rx.Observable<ProgressEvent>;
  state: Rx.Observable<Number>;
  _request: IConnectionConfig;
  constructor(req:IConnectionConfig) {
    //...
  }
  retry() {
    return new XHRConnection(this._request);
  }
}

class XHRConnectionBuilder () {
  create (req:IConnectionConfig) { return new XHRConnection(req)}
}

class BaseConnectionConfig implements IConnectionConfig {
  getProgressively: boolean;
  method: string;
  hot: boolean;
  responseType: string;
  persistBeyondDisposal: boolean;
  constructor() {
    this.getProgressively = false;
    this.persistBeyondDisposal = false;
    this.method = 'GET';
    this.hot = true;
    this.responseType = '';
  }
}

interface IConnectionConfig {
  getProgressively: boolean;
  method: string;
  hot: boolean;
  responseType: string;
  persistBeyondDisposal?: boolean;
  url?: string;
  timeout?: number;
  body?: string|FormData;
  headers?:Object|Map<string, string>
}

interface IResponse {
  headers: Map<string, string>
  data: string|ArrayBuffer|Blob|Document|Object;
  status: number;
}