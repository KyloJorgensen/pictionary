'use stirct';

var http = require('http'),
	path = require('path'),
	express = require('express'),
	socket_io = require('socket.io'),
	app = express();

var WORDS = ["word", "letter", "number", "person", "pen", "class", "people", "sound", "water", "side", "place", "man", "men", "woman", "women", "boy", "girl", "year", "day", "week", "month", "name", "sentence", "line", "air", "land", "home", "hand", "house", "picture", "animal", "mother", "father", "brother", "sister", "world", "head", "page", "country", "question", "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree", "farm", "story", "sea", "night", "day", "life", "north", "south", "east", "west", "child", "children", "example", "paper", "music", "river", "car", "foot", "feet", "book", "science", "room", "friend", "idea", "fish", "mountain", "horse", "watch", "color", "face", "wood", "list", "bird", "body", "dog", "family", "song", "door", "product", "wind", "ship", "area", "rock", "order", "fire", "problem", "piece", "top", "bottom", "king", "space"];

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var clients = {};
var designatedDrawer = {user: ''};

var artist = true;
var randomWord = 'default';

io.on('connection', function (socket) {

    console.log('Client connected');

    clients[socket.id] = socket;

    if (designatedDrawer.user) {
    	console.log('here');
    } else {
    	console.log('there');
    	designatedDrawer.user = socket;
    }

    console.log(Object.keys(clients));

    socket.on('go', function() {
        console.log('id: ', socket.id);
    });

    socket.emit('show');

    function artist(socket) {
	    socket.emit('artist', function() {
	    	var data = {};
	    	data.artist = function() {
	    		if (designatedDrawer.user == socket) {
	    			return true;
	    		}
	    		return false;
	    	}();
	    	if (data.artist) {
	    		generateRandomWord();
	    		data.word = randomWord;
	    	}
	    	return data;
	    }());
	};

	artist(socket);

    function generateRandomWord() {
    	randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    socket.on('newgame', function() {
		designatedDrawer.user = '';
	    artist(socket);
	    console.log('this1', socket.id);
    });

    socket.on('disconnect', function() {
        console.log('A user has disconnected');
        delete clients[socket.id];
        if (designatedDrawer.user = socket) {
        	console.log('user: ', socket.id);
        	socket.broadcast.emit('newgame', 'Artist left');
        }
    });

    socket.on('draw', function(position) {
    	if (designatedDrawer.user == socket) {
    		socket.broadcast.emit('draw', position);
    	}
    });

    socket.on('guess', function(guess) {
    	socket.broadcast.emit('guess', guess);
    	if (guess == randomWord){
    		socket.broadcast.emit('newgame', 'Word Was Guessed Correctly');
    		generateRandomWord();
    		socket.emit('artist', {artist: true, word: randomWord});
    	}
    });
});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/index.html'))
});

server.listen(8080);