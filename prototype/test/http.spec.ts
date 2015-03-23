/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;
declare var beforeEach;
declare var afterEach;
declare var fit;
declare var fdescribe;

import {http, Response, Backend, Connection} from '../public/http';
import Rx = require('rx');

describe('Http', function() {
    var baseResponse;
    beforeEach(function() {
        baseResponse = new Response({
            responseText: 'base response',
            bytesLoaded: 0,
            totalBytes: 0,
            previousBytes: 0
        });
    });

    afterEach(function() {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });

    it('should perform a get request for given url if only passed a string', function(done) {
        let url = 'http://basic.connection';
        http(url).subscribe(function(val: Response) {
            expect(val.responseText).toBe('base response');
            done();
        });
        let connection = Backend.getConnectionByUrl(url);
        connection.mockRespond(baseResponse);
    });


    describe('downloadObserver', function() {
    });

    describe('uploadObserver', function() {
    });

    describe('stateObserver', function() {
    });


    describe('Hot and Cold', function() {
    });


    describe('Response', function() {
    });


    describe('retry', function() {
    });


    describe('abort', function() {
    });


    describe('caching', function() {
    });


    describe('transformation', function() {
    });
});


describe('Connection', function() {

});


describe('Backend', function() {
    let url = 'https://foo.bar';
    let observer: Rx.Observer<any>;
    let connection: Connection;

    beforeEach(function() {
        Backend.reset();
        observer = Rx.Observer.create(function() {}, function() {}, function() {});
        connection = new Connection(observer);
        connection.url = url;
    });


    afterEach(function() {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });


    describe('.getConnectionByUrl()', function() {
        it('should return null if no connection for given url', function() {
            expect(Backend.getConnectionByUrl('foo')).toBe(null);
        });


        it('should return the connection if one exists for given url', function() {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, connection);
            expect(Backend.getConnectionByUrl(url) instanceof Connection).toBe(true);
            connection.readyState = 4;
        });
    });


    describe('.reset()', function() {
        it('should clear all connections', function() {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, connection);
            expect(Backend.connections.size).toBe(1);
            Backend.reset();
            expect(Backend.connections.size).toBe(0);
        });
    });


    describe('.verifyNoPendingConnections()', function() {
        it('should throw if any connection does not have a complete readystate', function() {
            Backend.connections.set(url, connection);
            expect(Backend.verifyNoPendingConnections).toThrow(
                new Error(`Connection for ${url} has not been resolved`));
            connection.readyState = 4;
            expect(Backend.verifyNoPendingConnections).not.toThrow();
        });
    })
});


describe('BaseConnectionConfig', function() {
    it('should create a new object when setting new values', function() {
    });
});
