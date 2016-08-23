var pictionary = function(socket) {
    var drawer = false;

    socket.on('artist', function(data) {
        drawer = data.artist;
        if (drawer) {
            $('#guess').hide();
            $('.artist').show();
            $('#artist-word').html(data.word);
        } else {
            $('#guess').show();
            $('.artist').hide();
        }
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

    socket.on('clearCanvas', function() {
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);
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

    socket.emit('artist');

    $('.artist').on('click', '#canvas-button-clear', function() {
        socket.emit('clearCanvas');
    });
};

$(document).ready(function() {
    var socket = io();
    pictionary(socket);
});