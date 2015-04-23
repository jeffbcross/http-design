/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
/// <reference path="shared-declarations.d.ts" />
import {Http} from '../public/http';
import {Connection, Backend} from '../public/MockConnection';
import {BaseConnectionConfig, ConnectionConfig} from '../public/BaseConnectionConfig';
import {Methods} from '../public/Methods';
import {Response} from '../public/Response';
import {Request} from '../public/Request';

var VirtualTimeScheduler = require('../node_modules/rx/dist/rx.virtualtime.js');
var Rx = require('../node_modules/rx/dist/rx.testing.js');
var di = require('di');

describe('MockConnection', () => {
    let url = 'https://foo.bar';
    let observer: Rx.Observer<any>;
    let connection: Connection;
    let injector;
    let backend;

    beforeEach(() => {
        observer = Rx.Observer.create(() => { }, () => { }, () => { });
        let config = BaseConnectionConfig.merge({ url: url });

        injector = new di.Injector();
        connection = injector.get(Connection);
        backend = injector.get(Backend);
    });


    afterEach(() => {
        //backend.verifyNoPendingRequests();
        backend.reset();
    });


    describe('.getConnectionByUrl()', () => {
        beforeEach(() => {
            backend.reset();
        });

        it('should return null if no connection for given url', () => {
            expect(backend.getConnectionByUrl('foo')).toEqual([]);
        });


        it('should return the connection if one exists for given url', () => {
            expect(backend.requests.size).toBe(0);
            backend.requests.set(url, [connection]);
            expect(backend.getConnectionByUrl(url)[0] instanceof Connection).toBe(true);
            connection.readyState = 4;
        });


        it('should return the connection for url+method combo if method provided', () => {

        })
    });


    describe('.reset()', () => {
        it('should clear all connections', () => {
            expect(backend.requests.size).toBe(0);
            backend.requests.set(url, [connection]);
            expect(backend.requests.size).toBe(1);
            backend.reset();
            expect(backend.requests.size).toBe(0);
        });
    });


    describe('.verifyNoPendingRequests()', () => {
        it('should throw if any connection does not have a complete readystate', () => {
            connection.url = url;
            backend.requests.set(url, [connection]);
            expect(backend.verifyNoPendingRequests).toThrow(
                new Error(`Request for ${url} has not been resolved`));
            connection.readyState = 4;
            expect(backend.verifyNoPendingRequests).not.toThrow();
        });
    })
});