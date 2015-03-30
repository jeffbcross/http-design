/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
import Rx = require('rx');
import {BaseConnectionConfig, ConnectionConfig, IConnectionConfig} from './BaseConnectionConfig';
import {Request} from './Request';
import {Methods} from './Methods';
import {ReadyStates} from './ReadyStates';
import {Backend, Connection} from './MockConnection';
//import {Backend} from './XHRConnection';

export function http(config: string|IConnectionConfig) {
    let baseConnection = new BaseConnectionConfig({});

    let connectionConfig = baseConnection.merge(typeof config === 'string' ?
        new ConnectionConfig('get', config) :
        config);

    return Rx.Observable.just(connectionConfig).
        flatMap(connectionConfig => {
            let connection: Connection = Backend.createConnection(connectionConfig);
            let request: Request = connection.request;
            let requests = connectionConfig.requestTransformer(Rx.Observable.just(request));
            let connectionResponses = requests.flatMap(request => {
                return Rx.Observable.zip(Rx.Observable.just(request), connection.send(request),
                    (req, res) => {
                        return [req, res]
                    }).
                do((arr) => {
                    if(connectionConfig.cacheSetter) {
                        connectionConfig.cacheSetter(arr[0], arr[1]);
                    }
                }).
                map((arr) => arr[1]);
            });
            let responses;

            if (connectionConfig.cacheGetter) {
                responses = connectionConfig.cacheGetter(requests).
                    do(cachedResponse => {
                        cachedResponse.fromCache = true;
                    }).
                    flatMap(cachedResponse => cachedResponse ?
                        Rx.Observable.return(cachedResponse) :
                        connectionResponses).
                    do(response => connection.readyState = response.fromCache ?
                            4 :
                            connection.readyState);
            } else {
                responses = connectionResponses;
            }

            return connectionConfig.responseTransformer(responses);
        });
}
