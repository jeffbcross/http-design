/// <reference path="bower_components/immutable/dist/immutable.d.ts" />
/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
/// <reference path="BaseConnectionConfig.ts" />
import Immutable = require('immutable');
import Rx = require('rx');
import {BaseConnectionConfig} from './BaseConnectionConfig';

export class Response {
    responseText: string;
    bytesLoaded: number;
    totalBytes: number;
    previousBytes: number;
    constructor (responseText:string, bytesLoaded:number, totalBytes:number, previousBytes:number) {
        this.responseText = responseText;
        this.bytesLoaded = bytesLoaded;
        this.totalBytes = totalBytes;
        this.previousBytes = previousBytes;
        console.log('constructed!');
        var map = Immutable.Map({ foo: 'bar' });
    }
    
    getLatestChunk ():string {
        return this.responseText.slice(this.previousBytes) || '';
    }
}

export function http(config:string|Immutable.Map<string,string|boolean>) {
    let connectionConfig = BaseConnectionConfig.merge(
        typeof config === 'string' ?
          Immutable.Map<string,string>({url: config}):
          config
        )

    return Rx.Observable.create(function(observer) {
        observer.onNext('foobar');
      /*
        var xhr = new XMLHttpRequest();
        var totalLoaded;
        xhr.onerror = observer.onError;
        
        if (newConfig.get('getProgressively')) {
          xhr.onprogress = function(e) {
            var response = new Response(xhr.responseText, e.loaded, e.total, totalLoaded || 0);
            observer.onNext(response);
            totalLoaded = e.loaded;
          }
          xhr.onload = function() {
            observer.onCompleted();
          };
        } else {
          xhr.onload = function () {
            observer.onNext(xhr.responseText);
            observer.onCompleted();
          }
        }
        xhr.open(newConfig.method, newConfig.url);
        xhr.send();
        */
  });
}

/*http('http://localhost:8000/slow').
  subscribe(function(res:Response) {
    console.log('chunk', res.getLatestChunk());
  },
  function(e) {
    console.log('error', e);
  },
  function() {
    console.log('done');
  });
*/