/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />

import {BaseConnectionConfig, ConnectionConfig} from './BaseConnectionConfig';
import {IConnectionConfig} from './IConnection';
import {Methods} from './Methods';
import {Backend, Connection} from './MockConnection';
import {ReadyStates} from './ReadyStates';
import {Request} from './Request';
import {Response} from './Response';
import Rx = require('rx');
/**
 * This function is bound to a single underlying connection mechanism, such as XHR, which could be
 * mocked with dependency injection by replacing the `Backend` binding. For other transports, like
 * JSONP or Node, a separate http function would be created, such as httpJSONP.
 *
 * Ideally, much of the logic used here could be moved out of http and re-used.
 *
 **/
//import {Backend} from './XHRConnection';
export function http(config: string|IConnectionConfig) {
    // Eventually the config will already be instantiated and just injected/merged.
    let baseConnection = new BaseConnectionConfig({});

    // If just passed in a url, create a fully-qualified config based on base.
    let connectionConfig = baseConnection.merge(typeof config === 'string' ?
        new ConnectionConfig(Methods.GET, config) :
        config);

    return Rx.Observable.just(connectionConfig).
        flatMap(connectionConfig => {
            // Prep the connection
            let connection: Connection = Backend.createConnection(connectionConfig);
            // For now, request gets generated in connection...for now
            let request: Request = connection.request;
            // Process request through config-provided transformer (supports async)
            let requests = connectionConfig.requestTransformer(Rx.Observable.just(request));
            let connectionResponses = requests.flatMap(request => {
                return Rx.Observable.zip(Rx.Observable.just(request), connection.send(request),
                    (req, res) => {
                        return [req, res]
                    }).
                do((arr) => {
                    // Give req/res to cacheSetter
                    if(connectionConfig.cacheSetter) {
                        connectionConfig.cacheSetter(arr[0], arr[1]);
                    }
                    }).
                /**
                 * Return response
                 * It's a bit hacky that we're passing an array of Req/Res at this point. This is so
                 * that both objects are available to the cacheSetter. Implementation should be
                 * re-considered.
                 **/
                map((arr) => arr[1]);
            });
            let responses;

            // Give cacheGetter a chance to resolve response from cache
            if (connectionConfig.cacheGetter) {
                responses = connectionConfig.cacheGetter(requests).
                    do(cachedResponse => {
                        cachedResponse.fromCache = true;
                    }).
                    flatMap(cachedResponse => cachedResponse ?
                        Rx.Observable.return(cachedResponse) :
                        connectionResponses).
                    do((response:Response) => connection.readyState = response.fromCache ?
                            4 :
                            connection.readyState);
            } else {
                responses = connectionResponses;
            }

            return connectionConfig.responseTransformer(responses);
        });
}
