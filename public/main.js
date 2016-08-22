var WORDS = ["word", "letter", "number", "person", "pen", "class", "people", "sound", "water", "side", "place", "man", "men", "woman", "women", "boy", "girl", "year", "day", "week", "month", "name", "sentence", "line", "air", "land", "home", "hand", "house", "picture", "animal", "mother", "father", "brother", "sister", "world", "head", "page", "country", "question", "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree", "farm", "story", "sea", "night", "day", "life", "north", "south", "east", "west", "child", "children", "example", "paper", "music", "river", "car", "foot", "feet", "book", "science", "room", "friend", "idea", "fish", "mountain", "horse", "watch", "color", "face", "wood", "list", "bird", "body", "dog", "family", "song", "door", "product", "wind", "ship", "area", "rock", "order", "fire", "problem", "piece", "top", "bottom", "king", "space"];

var pictionary = function(socket) {
    var drawer = false;

    socket.on('artist', function(data) {
        console.log(data);
        drawer = data.artist;
        if (drawer) {
            $('#guess').hide();
            $('#artist').show();
            $('#artist-word').html(data.word);
        } else {
            $('#guess').show();
            $('#artist').hide();
        }
    });

    socket.on('show', function() {
        console.log('showing text');
        socket.emit('go');
    });

    socket.on('connections', function() {
        socket.emit('connections', drawer);
    });

    socket.on('newgame' , function(message) {
        console.log(message);
        socket.emit('newgame', '');
    });

    var canvas, context;

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    var drawing = false;
    canvas.on('mousemove', function(event) {
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        if (drawing && drawer) {
            draw(position);
            socket.emit('draw', position);
        }
    }).on('mousedown', function() {
        drawing = true;
    }).on('mouseup', function() {
        drawing = false;
    });

    socket.on('draw', draw);

    var guessBox;

    var addGuess = function(guess) {
        lastGuess.html(guess);
    };

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        addGuess(guessBox.val());
        socket.emit('guess', guessBox.val());
        guessBox.val('');
    };

    guessBox = $('#guess input');
    lastGuess = $('#lastGuess');
    guessBox.on('keydown', onKeyDown);

    socket.on('guess', addGuess);

};

$(document).ready(function() {
    var socket = io();
    pictionary(socket);
});