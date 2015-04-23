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
        let newConfig;
        if (typeof config === 'string') {
            newConfig = BaseConnectionConfig.merge({ method: Methods.GET, url: config });
        } else {
            newConfig = BaseConnectionConfig.merge(Immutable.fromJS(config));
        }

        return Rx.Observable.create((observer) => {
            let connection = new Connection();
            //TODO: just pass the whole friggin object
            let request = new Request(newConfig.get('url'));
            connection.send(request).subscribe(observer);
        });
    }
}


di.annotate(Http, new di.Inject(ConnectionFactory));
