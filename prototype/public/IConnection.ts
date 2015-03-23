/// <reference path="bower_components/rxjs/ts/rx.all.d.ts" />
import {Response} from './Response';
import {IConnectionConfig} from './BaseConnectionConfig';

export interface IConnectionBackend {
    createConnection(observer: Rx.Observer<Response>, config: IConnectionConfig): IConnection;
}

export interface IConnection {
    readyState: number;
    url: string;
    send(): void;
}
