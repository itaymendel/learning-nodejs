var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./lib/chat_server');

// Create HTTP server
var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

// Startign servers
server.listen(8888, function() {
  console.log("Server listening on port 8888.");
});
chatServer.listen(server);

// 404
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resouce not found.');
  response.end();
}


// Send file
function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

// Send file from cache
function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function (err, data) {
          if (err) {
            console.log('Error while loading file ' + absPath + ' to cache: ' + err);
            send404(response);
          } else {
            cache[absPath] = data;
            console.log(absPath + ' loaded to chache');
            sendFile(response, absPath, data);
          }
        });
      } else {
        console.log('File not found: ' + absPath);
        send404(response);
      }
    });
  }
}
