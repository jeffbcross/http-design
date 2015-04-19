/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
declare var require;

import {BaseConnectionConfig, ConnectionConfig} from './BaseConnectionConfig';
import {IConnectionConfig} from './IConnection';
import {Methods} from './Methods';
import {Backend, ConnectionFactory} from './MockConnection';
import {ReadyStates} from './ReadyStates';
import {Request} from './Request';
import {Response} from './Response';
import Rx = require('rx');
import Immutable = require('immutable');

var di = require('di');

/**
 * This function is bound to a single underlying connection mechanism, such as XHR, which could be
 * mocked with dependency injection by replacing the `Backend` binding. For other transports, like
 * JSONP or Node, a separate http function would be created, such as httpJSONP.
 *
 * Ideally, much of the logic used here could be moved out of http and re-used.
 *
 **/
//import {Backend} from './XHRConnection';
export function Http (Connection) {
    return function http(config: string|Object) {
        // If just passed in a url, create a fully-qualified config based on base.
        let configMap: Immutable.Map<string, string|boolean|Methods> = typeof config === 'string' ?
            Immutable.Map({ method: Methods.GET, url: config }) :
            Immutable.Map(config);

        return Rx.Observable.create((observer) => {
            let connection = new Connection();
            let request = new Request(configMap.get('url'));
            connection.send(request).subscribe(observer);
        });
    }
}


di.annotate(Http, new di.Inject(ConnectionFactory));
