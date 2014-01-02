#!/usr/bin/env nodejs

var connect = require('connect')
, app = connect()
, httpsrv = require('http').createServer(app)
, io = require('socket.io').listen(httpsrv)
, fs = require('fs')
, randId =Math.floor( Math.random() * 100000)+100000;

process.on('SIGUSR2', function() { randId++; io.sockets.emit('news', { refresh: randId }); });

httpsrv.listen(8000);

app.use(connect.logger('dev'));

app.use(connect.static(__dirname + '/public'));

app.use(function (req, res) {
    fs.readFile(__dirname + '/index.html',
                function (err, data) {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Error loading index.html');
                    }

                    res.writeHead(200);
                    res.end(data);
                });
});

var lstatus = null;

setInterval(function() {
    mpd.getStatus(function(result) {
        lstatus = result;
        io.sockets.emit('status', result);
    }, errCb);
}, 1000);

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world', refresh: randId });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    mpd.getPlayListInfo(function(result) {
        io.sockets.emit('playlist info' ,result);
    }, errCb);
    socket.on('get artists', function(cb) {
        mpd.getAllArtists(function(result) {
            cb(result);
        }, errCb);
    });
    socket.on('pause', function() {
        mpd.pause();
    });
    socket.on('play', function() {
        mpd.play();
    });
    socket.on('previous', function() {
        mpd.previous();
    });
    socket.on('next', function() {
        mpd.next();
    });
    
    socket.on('seek', function(posf) {
        try {
            mpd.seek(lstatus.song, posf * lstatus.currentsong.time);
        } catch(e) { io.sockets.emit('some error'); console.log(e); }
    });
});

var errCb = function() {
  io.sockets.emit('some error');
}


var mpdconnector = require('./mpdconnector');



var mpd = mpdconnector('127.0.0.1' , 6600);

mpd.connect( );



