/**
 * Experimenting with download progress.
 * Example works in Firefox, not in Chrome, even if served from non-localhost. Not sure why.
 * $ node slow-download.js
 * Open http://localhost:8000
 * Watch console for progress events ever decisecond for 1 second.
 */

var http = require('http');

var server = http.createServer();
server.on('request', function(req, res) {
  switch (req.url) {
    case "/slow":
      handleSlow(req, res);
      break;
    default:
      handlePage(req, res);
  }
});
server.listen(8000);

function handlePage (req, res) {
  res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
  res.end([
    '<!doctype html><html><head>',
    '<meta charset="UTF-8">',
    '<script>',
    '  var xhr = new XMLHttpRequest();',
    '  xhr.numChunks = 0;',
    '  xhr.open("get", "/slow");',
    '  xhr.onprogress = function(evt) {',
    '    console.log("chunk " + xhr.numChunks++ + ": " + xhr.responseText.slice(xhr.alreadyLoaded));',
    '    xhr.alreadyLoaded = evt.loaded;',
    '  }',
    '  xhr.send();',
    '</script></head>',
    '<body>Body</body></html>'
  ].join('\n'));

}

function handleSlow (req, res) {
  var i = 0;
  res.writeHead(200, {
    'Content-Length': '191',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.write('get ready for some data!');
  var interval = setInterval(function() {
    res.write('another chunk ' + ++i);
    console.log(i, 'i')
    if (i > 10) {
      clearInterval(interval);
      res.end();
    }
  }, 100);
}