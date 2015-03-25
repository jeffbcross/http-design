/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
import Rx = require('rx');
import {BaseConnectionConfig, ConnectionConfig, IConnectionConfig} from './BaseConnectionConfig';
import {Response} from './Response';
import {Methods} from './Methods';
import {ReadyStates} from './ReadyStates';
import {Backend} from './MockConnection';
//import {Backend} from './XHRConnection';

export function http(config: string|IConnectionConfig) {
    let baseConnection = new BaseConnectionConfig();
    let connectionConfig = baseConnection.merge(
        typeof config === 'string' ?
            new ConnectionConfig('get', config) :
            config
        )

    let observable = Rx.Observable.create((observer) => {
        let connection = Backend.createConnection(observer, connectionConfig);
        connection.send();
    });

    if (!connectionConfig.cold) {
        let connectable = observable.publish();
        connectable.connect();
        return connectable;
    }

    return observable;
}
