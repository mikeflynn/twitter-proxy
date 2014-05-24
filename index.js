var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');

var serialize = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

var twitter = function(path, method, post, headers, callback) {
  var options = {
    host: 'api.twitter.com',
    path:  path,
    method: method
  };

  if(typeof headers === 'object') {
    options['headers'] = headers;
  }

  var req = https.request(options, function(resp) {
    var str = '';

    resp.on('data', function(chunk) {
      str += chunk;
    });

    resp.on('end', function() {
      callback(str);
    });
  });

  if(method === 'POST') {
    req.write(serialize(post));
  }

  req.end();
};

var app = express();

app.use(bodyParser());

app.set('port', (process.env.PORT || 5000));

app.post('/*', function(request, response) {
  var path = request.originalUrl;
  var headers = {
    'content-type': request.headers['content-type'],
    'content-length': request.headers['content-length'],
    'Authorization': (request.headers['Authorization'] ? request.headers['Authorization'] : false)
  };
  var body = request.body;

  var callback = function(resp) {
    response.send(resp);
  };

  twitter(path, 'POST', body, headers, callback);
});

app.get('/*', function(request, response) {
  var path = request.originalUrl;
  var headers = {
    'content-type': request.headers['content-type'],
    'content-length': request.headers['content-length']
  };

  var callback = function(resp) {
    response.send(resp);
  };

  twitter(path, 'GET', '', headers, callback);
});

app.listen(app.get('port'), function() {
  console.log("Twitter Proxy API is running at localhost:" + app.get('port'));
});