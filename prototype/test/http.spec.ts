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
import {BaseConnectionConfig, ConnectionConfig} from '../public/BaseConnectionConfig';
import {Methods} from '../public/Methods';
import {Response} from '../public/Response';
import {Request} from '../public/Request';
import Rx = require('rx');

//It's immutable, so we can assign it once
let baseConnectionConfig = new BaseConnectionConfig({});

describe('Http', () => {
    let baseResponse;
    beforeEach(() => {
        baseResponse = new Response({responseText:'base response'});
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
        let config = new ConnectionConfig(Methods.GET, url);
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
            method: Methods.GET,
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
            http(config).publish().connect();
            let connections = Backend.getConnectionByUrl(url);
            let connection = connections[0];
            let response = new Response({});
            response.totalBytes = 100;
            response.bytesLoaded = 0;
            for (let i = 1; i <= 5; i++) {
                response.bytesLoaded = i * 20;
                connection.mockDownload(response);
            }

            expect(chunks).toBe(5);
        });

        it('should call complete when all bytes have been downloaded', () => {
            let url = 'htp://chunk.connection';
            let complete = jasmine.createSpy('complete');
            let config = {
                url: url,
                downloadObserver: Rx.Observer.create(() => { }, () => { }, complete)
            }
            http(config).publish().connect();
            let connections = Backend.getConnectionByUrl(url);
            let connection = connections[0];
            let response = new Response({});
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


    describe('Response', () => {
    });


    describe('retry', () => {
        it('should try the connection specified number of times on errors', () => {
            let url = 'http://flaky.url';
            let successSpy = jasmine.createSpy('success');
            let errorSpy = jasmine.createSpy('error');
            let response = new Response({reponseText: 'finally!'})
            let completeSpy = jasmine.createSpy('complete');
            http(url).
                retry(2).
                subscribe(successSpy, errorSpy, completeSpy);
            let connections = Backend.getConnectionByUrl(url);
            expect(connections.length).toBe(1);
            let connection = connections.pop();
            connection.mockError();
            connection = connections.pop();
            connection.mockRespond(response);
            expect(errorSpy.calls.count()).toBe(0);
            expect(successSpy.calls.count()).toBe(1);
            expect(completeSpy).toHaveBeenCalled();
        });


        it('should retry intelligently when provided a function');
    });


    describe('abort', () => {
        it('should call cancel on the connection', () => {
        })
    });


    describe('caching', () => {
        afterEach(Backend.reset);

        it('should set response to cache setter', (done) => {
            let req, res;
            let url = 'http://cache.me.plz';
            let request = new Request(url);
            let config = {
                url: url,
                requestTransformer: (req) => {
                    return Rx.Observable.just(request);
                },
                cacheSetter: jasmine.createSpy()
            }
            let response = new Response({});
            http(config).subscribe(() => {
                expect(config.cacheSetter).toHaveBeenCalledWith(request, response);
                done();
            });
            let connection = Backend.getConnectionByUrl(url)[0];
            connection.mockRespond(response);
        });


        it('should try to load response from cache', () => {
            let url = 'http://cache.me.please';
            let response = new Response({});
            let subject = new Rx.Subject<Response>();
            let config = {
                url: url,
                cacheGetter: (req) => subject
            };
            let finalRes;
            http(config).
                subscribe(res => finalRes = res);
            subject.onNext(response);
            expect(finalRes).toBe(response);
        });


        it('should set connection to done after response received', () => {
            let url = 'http://cache.me.please';
            let response = new Response({});
            let subject = new Rx.Subject<Response>();
            let config = {
                url: url,
                cacheGetter: (req) => subject
            };
            let finalRes;
            http(config).
                subscribe(res => finalRes = res);
            let connection = Backend.getConnectionByUrl(url)[0];
            expect(connection.readyState).toBe(1);
            subject.onNext(response);
            expect(connection.readyState).toBe(4);
        });
    });


    describe('transformation', () => {
        afterEach(Backend.reset);

        it('should apply request transformations prior to sending', () => {
            let url = 'http://transform.me';
            let config = {
                url: url,
                requestTransformer: (reqs:Rx.Observable<Request>):Rx.Observable<Request> => {
                    return reqs.map(req => new Request(url, 'somedata'));
                }
            };
            http(config).publish().connect();
            let connection = Backend.getConnectionByUrl(url)[0];
            expect(connection.mockSends[0].data).toBe('somedata');
        });


        it('should apply response transformations before publishing', () => {
            let url = 'http://transform.me';
            let config = {
                url: url,
                responseTransformer: (responses:Rx.Observable<Response>):Rx.Observable<Response> => {
                    return responses.map(response => new Response({responseText:'somedata'}));
                }
            };
            let txt;
            http(config).subscribe(res => {
                txt = res.responseText;
            });
            let connection = Backend.getConnectionByUrl(url)[0];
            connection.mockRespond(new Response({responseText:'no data'}));
            expect(txt).toBe('somedata');
        });
    });


    describe('data types', () => {

    });
});


describe('Connection', () => {
    describe('.cancel()', () => {

    });
});


describe('Backend', () => {
    let url = 'https://foo.bar';
    let observer: Rx.Observer<any>;
    let connection: Connection;

    beforeEach(() => {
        observer = Rx.Observer.create(() => { }, () => { }, () => { });
        let config = baseConnectionConfig.merge({ url: url });
        connection = new Connection(config);
    });
    beforeEach(Backend.reset);


    afterEach(() => {
        Backend.verifyNoPendingConnections();
        Backend.reset();
    });


    describe('.getConnectionByUrl()', () => {
        beforeEach(() => {
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
