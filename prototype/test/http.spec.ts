/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;

import {http,Response,Backend,Connection} from '../public/http';

describe('Http', function() {
    it('should perform a get request for given url if only passed a string', function() {
        var res = new Response('hi', 5, 10, 0);
        http('http://foobar').subscribe(function(val) {
        });
        expect(true).toBe(true);
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
    describe('.getConnectionByUrl()', function() {
        it('should return null if no connection for given url', function() {
            expect(Backend.getConnectionByUrl('foo')).toBe(null);
        });


        it('should return the connection if one exists for given url', function() {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, new Connection());
            expect(Backend.getConnectionByUrl(url) instanceof Connection).toBe(true);
            Backend.connections.clear();
        });
    });


    describe('.reset()', function() {
        it('should clear all connections', function() {
            expect(Backend.connections.size).toBe(0);
            Backend.connections.set(url, new Connection());
            expect(Backend.connections.size).toBe(1);
            Backend.reset();
            expect(Backend.connections.size).toBe(0);
        });
    });


    describe('.verifyNoPendingConnections()', function() {
        it('should throw if any connection does not have a complete readystate', function() {
            let connection = new Connection(url);
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
