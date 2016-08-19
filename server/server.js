'use stirct';

var http = require('http'),
	express = require('express'),
	socket_io = require('socket.io'),
	app = express();

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

server.listen(8080);