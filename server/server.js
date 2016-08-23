'use stirct';

var http = require('http'),
	path = require('path'),
	express = require('express'),
    $ = require('jquery'),
	socket_io = require('socket.io'),
	app = express();

var WORDS = ["word", "letter", "number", "person", "pen", "class", "people", "sound", "water", "side", "place", "man", "men", "woman", "women", "boy", "girl", "year", "day", "week", "month", "name", "sentence", "line", "air", "land", "home", "hand", "house", "picture", "animal", "mother", "father", "brother", "sister", "world", "head", "page", "country", "question", "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree", "farm", "story", "sea", "night", "day", "life", "north", "south", "east", "west", "child", "children", "example", "paper", "music", "river", "car", "foot", "feet", "book", "science", "room", "friend", "idea", "fish", "mountain", "horse", "watch", "color", "face", "wood", "list", "bird", "body", "dog", "family", "song", "door", "product", "wind", "ship", "area", "rock", "order", "fire", "problem", "piece", "top", "bottom", "king", "space"];

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var clients = {};
var designatedDrawer = '';
var randomWord = 'default';
var picture = [];
var lastguess = 'no guess';


io.on('connection', function (socket) {

    console.log('Client connected');

    clients[socket.id] = socket;

    function gameRoleRequest(socket) {
        if (!designatedDrawer) {
            designatedDrawer = socket.id;
        }

	    socket.emit('artist', function() {
	    	var data = {};
            if (designatedDrawer == socket.id) {
                data.artist = true;
                randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
                data.word = randomWord;
            } else {
                data.artist = false;
            }
	    	return data;
	    }());
	};

    function drawWholePic() {
        for (var i = 0; i < picture.length; i++) {
            io.sockets.emit('draw', picture[i]);
        }
    }

    function draw(position) {
        if (vailidateDrawer()) {
            socket.broadcast.emit('draw', position);
            picture.push(position);
        }
    }

    function vailidateDrawer() {
        if (designatedDrawer == socket.id) {
            return true;
        }
        return false;
    }

    function vaildateGuess(guess) {
        if (!vailidateDrawer()) {
            lastguess = guess;
            socket.broadcast.emit('guess', guess);
            if (guess == randomWord){
                designatedDrawer = socket.id;
                socket.emit('artist', {artist: true, word: randomWord});
                newDesignatedDrawer();
            } 
        }
    }

    function newDesignatedDrawer() {
        var keys = Object.keys(clients);
        keys = shuffle(keys);
        for (var i = 0; i < keys.length; i++) {
            gameRoleRequest(clients[keys[i]]);
        }
        picture = [];
        io.sockets.emit('clearCanvas');
    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function clearCanvas() {
        if (vailidateDrawer()) {
            picture = [];
            io.sockets.emit('clearCanvas');
        }
    }

    function disconnectUser() {
        console.log('A user has disconnected');
        delete clients[socket.id];

        if (designatedDrawer == socket.id) {
            console.log('artist disconnected');
            designatedDrawer = '';
            newDesignatedDrawer();
        }
    }

    socket.on('draw', draw);

    socket.on('guess', vaildateGuess);

    socket.on('clearCanvas', clearCanvas);

    socket.on('disconnect', disconnectUser);


    gameRoleRequest(socket);
    socket.emit('guess', lastguess);
    drawWholePic();

});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/index.html'))
});

server.listen(8080);