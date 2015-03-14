/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;

import {http,Response} from '../public/http';

describe('http', function() {
    it('should be true', function() {
        var res = new Response('hi', 5, 10, 0);
        http('http://foobar').subscribe(function(val) {
            console.log('next!', val);
        });
      expect(true).toBe(true);
  });
});
