import {BaseConnectionConfig} from './BaseConnectionConfig';
import Immutable = require('immutable');

export interface IRequest {

}

export class Request {
  url: string;
  data: string;

  constructor(config: Immutable.Map<string,any>) {
    this.url = config.get('url');
    this.data = config.get('data');
  }
}