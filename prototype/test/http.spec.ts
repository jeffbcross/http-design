/// <reference path="../public/http.ts"/>
declare var describe;
declare var it;
declare var expect;

import {Response} from '../public/http';

describe('http', function() {
    it('should be true', function() {
      var res = new Response('hi', 5, 10, 0);
      expect(true).toBe(true);
  });
});
