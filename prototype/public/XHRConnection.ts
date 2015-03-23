/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
import {IConnectionBackend, IConnection} from './IConnection';
import {IConnectionConfig} from './BaseConnectionConfig';
import {ReadyStates} from './ReadyStates';
import {Response} from './Response';

export class Backend implements IConnectionBackend {
    createConnection(observer: Rx.Observer<Response>, config:IConnectionConfig):Connection {
        return new Connection(config);
    }
}

export class Connection implements IConnection {
    readyState: number;
    url: string;
    constructor(config:IConnectionConfig) {
        this.readyState = ReadyStates.UNSENT

    }

    send () {

    }
}