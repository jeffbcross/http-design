/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
/// <reference path="shared-declarations.d.ts" />

declare var fdescribe;
declare var xdescribe;

import {Http} from '../public/http';
import {Connection, Backend} from '../public/MockConnection';
import {BaseConnectionConfig, ConnectionConfig} from '../public/BaseConnectionConfig';
import {Methods} from '../public/Methods';
import {Response} from '../public/Response';
import {Request} from '../public/Request';

var VirtualTimeScheduler = require('../node_modules/rx/dist/rx.virtualtime.js');
var Rx = require('../node_modules/rx/dist/rx.testing.js');
var di = require('di');

fdescribe('MockConnection', () => {
    let url = 'https://foo.bar';
    let injector;
    let backend:Backend;
    let req: Request;
    let config;

    beforeEach(() => {
        config = BaseConnectionConfig.merge({ url: url });
        req = new Request(config);

        injector = new di.Injector();
        backend = injector.get(Backend);
    });


    afterEach((done) => {
        let pending = 0;
        backend.pendingConnections.subscribe((c) => pending++);
        done();
    });


    describe('connection inspection', () => {
        it('should provide unresolved connections in pendingConnections observable', () => {
            let pending = 0;
            let connectionGood = backend.createConnection(req);
            let requestBad = new Request(config);
            let connectionBad = backend.createConnection(requestBad);
            connectionGood.readyState = 4;
            connectionBad.readyState = 0;

            backend.pendingConnections.subscribe(() => pending++);
            expect(pending).toBe(1);
        });


        it('should be possible to see which connections resulted in an error', () => {
            let count = 0;

            let connectionBad = backend.createConnection(req);
            let errorResponse = new Response({});
            errorResponse.type = 'error';
            connectionBad.response.onNext(errorResponse);

            let connectionGood = backend.createConnection(req);
            let response = new Response({responseText: 'good response'});
            connectionBad.response.onNext(response);

            backend.connections.
                concatMap((c) => {
                    let responseObservable: Rx.Subject<Response> = c.response;
                    return responseObservable;
                }).
                filter(r => r.type === 'error').
                subscribe(r => count++);


            expect(count).toBe(1);
        });
    });


    describe('.createConnection()', () => {
        it('should create a connection', () => {
            let connection = backend.createConnection(req);
            expect(connection instanceof Connection).toBe(true);
        });


        it('should add the connection to backend.connections', () => {
            let count = 0;
            let nextSpy = jasmine.createSpy('onNext');

            let subscription = backend.connections.subscribe((obs) => {
                count++;
                nextSpy(obs);
            });

            backend.createConnection(req);
            expect(nextSpy).toHaveBeenCalled();
            expect(count).toBe(1);
        });


        it('should throw if not provided a request', () => {
            expect(
                backend.createConnection
            ).toThrow(new Error('createConnection requires an instance of Request, got undefined'));
        });
    });
});