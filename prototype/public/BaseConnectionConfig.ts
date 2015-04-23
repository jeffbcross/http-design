/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />
///

declare var require;

import {IConnectionConfig} from './IConnection';
import {Methods} from './Methods';
import {Request} from './Request';
import {Response} from './Response';
import Rx = require('rx');
import Immutable = require('immutable');

export class ConnectionConfig implements IConnectionConfig {
    downloadObserver: Rx.Observer<Response>;
    uploadObserver: Rx.Observer<any>;
    stateObserver: Rx.Observer<any>;
    constructor(public method?: Methods, public url?: string) {

    }
}

export var BaseConnectionConfig: Immutable.Map<any, any> = Immutable.Map({
  method: Methods.GET,
  url: null,
  downloadObserver: null,
  uploadObserver: null,
  stateObserver: null,
  requestTransformer: (req) => { return req },
  responseTransformer: (res) => { return res },
  cacheSetter: null,
  cacheGetter: null
});
