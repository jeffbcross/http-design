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
    let connectionConfig = baseConnection.merge(
        typeof config === 'string' ?
            new ConnectionConfig('get', config) :
            config
        )

    let observable = Rx.Observable.create((observer) => {
        let connection:Connection = Backend.createConnection(observer, connectionConfig);
        let request:Request = connection.request;

        if (connectionConfig.requestTransforms.length) {
            let requestObservable:Rx.Observable<Request> = Rx.Observable.fromArray([request]);
            connectionConfig.requestTransforms.reduce((prev, fn) => {
                return prev.map(fn);
            }, requestObservable).subscribe((req: Request) => {
                connection.send(req.data);
            });
        } else {
            connection.send(request.data);
        }
    });

    if (!connectionConfig.cold) {
        let connectable = observable.publish();
        connectable.connect();
        return connectable;
    }

    return observable;
}
