/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;
declare var beforeEach;
declare var afterEach;
declare var fit;
declare var fdescribe;
declare var xit;

import {http, Response, Backend, Connection, ConnectionConfig} from '../public/http';
import Rx = require('rx');

describe('Http', () => {
    var baseResponse;
    beforeEach(() => {
        baseResponse = new Response({
            responseText: 'base response',
            bytesLoaded: 0,
            totalBytes: 0,
            previousBytes: 0
        });
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
        let connection = Backend.getConnectionByUrl(url);
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
        let connection = Backend.getConnectionByUrl(url);
        connection.mockRespond(baseResponse);
        expect(text).toBe('base response');
    });


    it('should perform a get request for given url if passed a dictionary', (done) => {
        let url = 'http://basic.connection';
        let config = {
            method: 'get',
            url: url
        };
        http(config).subscribe((res: Response) => {
            expect(res.responseText).toBe('base response');
            done();
        });
        let connection = Backend.getConnectionByUrl(url);
        connection.mockRespond(baseResponse);
    });


    describe('downloadObserver', () => {
        xit('should report download progress to the observer', (done) => {
            let url = 'http://chunk.connection';
            let chunks = 0;
            let config = {
                url: url,
                downloadObserver: Rx.Observer.create(function(chunk) {
                    chunks++;
                }, () => { }, () => {
                        expect(chunks).toBe(5);
                        done();
                })
            }
            http(config);
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
            expect(Backend.getConnectionByUrl(url) instanceof Connection).toBe(true);
            connection.readyState = 4;
        });


        it('should NOT send the connection if passed cold value of true', () => {
            let url = 'http://hot.url'
            let config = {
                url: url,
                cold: true
            }
            http(config);
            expect(Backend.connections.size).toBe(0);
        });
    });


    describe('Response', () => {
    });


    describe('retry', () => {
    });


    describe('abort', () => {
    });


    describe('caching', () => {
    });


    describe('transformation', () => {
    });


    describe('data types', () => {

    });
});


describe('Connection', () => {

});


describe('Backend', () => {
    let url = 'https://foo.bar';
    let observer: Rx.Observer<any>;
    let connection: Connection;

    beforeEach(() => {
        Backend.reset();
        observer = Rx.Observer.create(() => {}, () => {}, () => {});
        connection = new Connection(observer);
        connection.url = url;
    });


    afterEach(() => {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });


    describe('.getConnectionByUrl()', () => {
        it('should return null if no connection for given url', () => {
            expect(Backend.getConnectionByUrl('foo')).toBe(null);
        });


        it('should return the connection if one exists for given url', () => {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, connection);
            expect(Backend.getConnectionByUrl(url) instanceof Connection).toBe(true);
            connection.readyState = 4;
        });


        it('should return the connection for url+method combo if method provided', () => {
        })
    });


    describe('.reset()', () => {
        it('should clear all connections', () => {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, connection);
            expect(Backend.connections.size).toBe(1);
            Backend.reset();
            expect(Backend.connections.size).toBe(0);
        });
    });


    describe('.verifyNoPendingConnections()', () => {
        it('should throw if any connection does not have a complete readystate', () => {
            Backend.connections.set(url, connection);
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
