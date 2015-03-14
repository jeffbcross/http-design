/// <reference path="bower_components/immutable/dist/immutable.d.ts" />
import Immutable = require('immutable');

export var BaseConnectionConfig = Immutable.Map<string,string|boolean>({
    method: 'get'
});
