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
var artist = true;
var randomWord = 'default';
io.on('connection', function (socket) {

    console.log('Client connected');


    socket.emit('artist', function() {
    	var data = {};
    	data.artist = artist;
    	if (data.artist) {
    		generateRandomWord();
    		data.word = randomWord;
    	} 
    	artist = false;
    	console.log(data);
    	return data;
    }());

    function generateRandomWord() {
    	randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    socket.on('newgame', function() {
	    socket.emit('artist', function() {
	    	var data = {};
	    	data.artist = artist;
	    	if (data.artist) {
	    		generateRandomWord();
	    		data.word = randomWord;
	    	} 
	    	artist = false;
	    	console.log(data);
	    	return data;
	    }());
    });

    socket.on('disconnect', function() {
        console.log('A user has disconnected');
        socket.broadcast.emit('connections', '');
    });

    socket.on('connections', function(drawer) {
		var newArtist = true,
			artistConnected = false;  

    	if (newArtist) {
    		setTimeout(function() {
    			if (!artistConnected) {
    				artist = true;
	    			io.sockets.emit('newgame', 'Artist left');
	    		}
    		}, 1000);
    		newArtist = false;
    	}

    	if (drawer) {
    		artistConnected = true;
    	}

    });

    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
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