/// <reference path="immutable.d.ts" />
/// <reference path="rx-lite.d.ts" />
var XHRConnection = (function () {
    function XHRConnection(req) {
        //...
    }
    XHRConnection.prototype.retry = function () {
        return new XHRConnection(this._request);
    };
    XHRConnection.prototype.exec = function () {
        //In case the
    };
    XHRConnection.create = function (req) {
        return new XHRConnection(req);
    };
    return XHRConnection;
})();
