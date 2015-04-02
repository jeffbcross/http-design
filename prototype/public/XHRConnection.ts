/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />
import {IConnectionBackend, IConnection, IConnectionConfig} from './IConnection';
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