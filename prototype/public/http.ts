/// <reference path="bower_components/immutable/dist/immutable.d.ts" />
/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
/// <reference path="BaseConnectionConfig.ts" />
import Immutable = require('immutable');
import {BaseConnectionConfig} from 'BaseConnectionConfig';

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
/*
function http(config:string|Immutable.Map<string,string|boolean>|object) {
    let connectionConfig;
    if (typeof config === 'string') {
        connectionConfig = BaseConnectionConfig.merge({
            url: config
        });
    } else if (config instanceof Immutable.Map || config instanceof Object) {
        connectionConfig = BaseConnectionConfig.merge(config)
    } else {
        throw new Error('Connection cannot be established without a configuration');
    }
    
    console.log('connectionConfig', connectionConfig);

  return Rx.Observable.create(function(observer) {
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
  });
}

http('http://localhost:8000/slow').
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