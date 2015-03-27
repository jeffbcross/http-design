/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
import Rx = require('rx');
import {BaseConnectionConfig, ConnectionConfig, IConnectionConfig} from './BaseConnectionConfig';
import {Request} from './Request';
import {Response} from './Response';
import {Methods} from './Methods';
import {ReadyStates} from './ReadyStates';
import {Backend, Connection} from './MockConnection';
//import {Backend} from './XHRConnection';

export function http(config: string|IConnectionConfig) {
    let baseConnection = new BaseConnectionConfig({});

    let connectionConfig = baseConnection.merge(typeof config === 'string' ?
        new ConnectionConfig('get', config) :
        config);

    let observable = Rx.Observable.just(connectionConfig).
        flatMap(connectionConfig => {
        let connection: Connection = Backend.createConnection(connectionConfig);
        let request: Request = connection.request;
        return connectionConfig.responseTransformer(connectionConfig.
                    requestTransformer(Rx.Observable.just(request)).
                    flatMap(request => connection.send(request)))
    });

    return observable;
}
