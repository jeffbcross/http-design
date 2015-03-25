/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;
declare var beforeEach;
declare var afterEach;
declare var fit;
declare var fdescribe;
declare var xit;
declare var jasmine;

import {http} from '../public/http';
import {Backend, Connection} from '../public/MockConnection';
import {BaseConnectionConfig, ConnectionConfig, IConnectionConfig} from '../public/BaseConnectionConfig';
import {Response} from '../public/Response';
import Rx = require('rx');

//It's immutable, so we can assign it once
let baseConnectionConfig = new BaseConnectionConfig();

describe('Http', () => {
    let baseResponse;
    beforeEach(() => {
        baseResponse = new Response('base response');
    });

    afterEach(() => {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });

    it('should perform a get request for given url if only passed a string', () => {
        let url = 'http://basic.connection';
        let text;
        http(url).subscribe((res: Response) => {
            text = res.responseText;
        });
        let connections = Backend.getConnectionByUrl(url);
        let connection = connections[0];
        connection.mockRespond(baseResponse);
        expect(text).toBe('base response');
    });


    it('should perform a get request for given url if passed a ConnectionConfig instance', () => {
        let url = 'http://basic.connection';
        let config = new ConnectionConfig('get', url);
        let text;
        http(config).subscribe((res: Response) => {
            text = res.responseText;

        });
        let connections = Backend.getConnectionByUrl(url);
        let connection = connections[0];
        connection.mockRespond(baseResponse);
        expect(text).toBe('base response');
    });


    it('should perform a get request for given url if passed a dictionary', () => {
        let url = 'http://basic.connection';
        let config = {
            method: 'get',
            url: url
        };
        let text;
        http(config).subscribe((res: Response) => {
            text = res.responseText;
        });
        let connections = Backend.getConnectionByUrl(url);
        let connection = connections[0];
        connection.mockRespond(baseResponse);
        expect(text).toBe('base response');
    });


    describe('downloadObserver', () => {
        afterEach(Backend.reset);


        it('should report download progress to the observer', () => {
            let url = 'http://chunk.connection';
            let chunks = 0;
            let config = {
                url: url,
                downloadObserver: Rx.Observer.create(() => {
                    chunks++;
                })
            }
            http(config);
            let connections = Backend.getConnectionByUrl(url);
            let connection = connections[0];
            let response = new Response();
            response.totalBytes = 100;
            response.bytesLoaded = 0;
            for (let i = 1; i <= 5; i++) {
                response.bytesLoaded = i * 20;
                connection.mockDownload(response);
            }

            expect(chunks).toBe(5);
        });

        it('should call complete when all bytes have been downloaded', function() {
            let url = 'htp://chunk.connection';
            let complete = jasmine.createSpy('complete');
            let config = {
                url: url,
                downloadObserver: Rx.Observer.create(() => { }, () => { }, complete)
            }
            http(config);
            let connections = Backend.getConnectionByUrl(url);
            let connection = connections[0];
            let response = new Response();
            response.totalBytes = 100;
            response.bytesLoaded = 100;
            expect(complete).not.toHaveBeenCalled();
            connection.mockDownload(response);
            expect(complete).toHaveBeenCalled();
            //TODO: assert call onNext as well
        });
    });

    describe('uploadObserver', () => {
    });

    describe('stateObserver', () => {
    });


    describe('Hot and Cold', () => {
        it('should send the connection if not passed cold property', () => {
            let url = 'http://hot.url'
            let config = {
                url: url
            }
            http(config);
            let connection = Backend.getConnectionByUrl(url);
            expect(Backend.getConnectionByUrl(url)[0] instanceof Connection).toBe(true);
            Backend.reset();

        });

        it('should only create one connection when subscribing to a hot connection', () => {
            let url = 'http://hot.url';
            let observable = http(url);
            let connections = Backend.getConnectionByUrl(url);
            expect(connections.length).toBe(1);
            observable.subscribe(() => { });
            expect(connections.length).toBe(1);
            Backend.reset();
        });

        it('should NOT send the connection if passed cold value of true', () => {
            let url = 'http://hot.url'
            let config = {
                url: url,
                cold: true
            }
            http(config);
            expect(Backend.connections.size).toBe(0);
            Backend.reset();
        });
    });


    describe('Response', () => {
    });


    describe('retry', () => {

    });


    describe('abort', () => {
        it('should call cancel on the connection', function() {
        })
    });


    describe('caching', () => {
    });


    describe('transformation', () => {
    });


    describe('data types', () => {

    });
});


describe('Connection', () => {
    describe('.cancel()', function() {

    });
});


describe('Backend', () => {
    let url = 'https://foo.bar';
    let observer: Rx.Observer<any>;
    let connection: Connection;

    beforeEach(() => {
        observer = Rx.Observer.create(() => { }, () => { }, () => { });
        let config = baseConnectionConfig.merge({ url: url });
        connection = new Connection(observer, config);
    });
    beforeEach(Backend.reset);


    afterEach(() => {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });


    describe('.getConnectionByUrl()', () => {
        beforeEach(function() {
            Backend.reset();
        });

        it('should return null if no connection for given url', () => {
            expect(Backend.getConnectionByUrl('foo')).toEqual([]);
        });


        it('should return the connection if one exists for given url', () => {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, [connection]);
            expect(Backend.getConnectionByUrl(url)[0] instanceof Connection).toBe(true);
            connection.readyState = 4;
        });


        it('should return the connection for url+method combo if method provided', () => {
        })
    });


    describe('.reset()', () => {
        it('should clear all connections', () => {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, [connection]);
            expect(Backend.connections.size).toBe(1);
            Backend.reset();
            expect(Backend.connections.size).toBe(0);
        });
    });


    describe('.verifyNoPendingConnections()', () => {
        it('should throw if any connection does not have a complete readystate', () => {
            Backend.connections.set(url, [connection]);
            expect(Backend.verifyNoPendingConnections).toThrow(
                new Error(`Connection for ${url} has not been resolved`));
            connection.readyState = 4;
            expect(Backend.verifyNoPendingConnections).not.toThrow();
        });
    })
});


describe('BaseConnectionConfig', () => {
    it('should create a new object when setting new resues', () => {
    });
});
