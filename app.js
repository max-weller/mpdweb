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
        //if (!lstatus || lstatus.song != result.song) updatePlaylist();
        lstatus = result;
        io.sockets.emit('status', result);
    }, errCb);
}, 1000);

function updatePlaylist() {
    mpd.getPlayListInfo(function(result) {
        io.sockets.emit('playlist info' ,result);
    }, errCb);
}

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world', refresh: randId });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    updatePlaylist();
    socket.on('get artists', function(cb) {
        mpd.getAllArtists(function(result) {
            cb(result);
        }, errCb);
    });
    socket.on('find', function(predType, predValue, cb) {
        mpd.getSongsByPredicate(predType, predValue, cb, errCb);
    });
    socket.on('ls', function(dir, cb) {
        mpd.listDirectory(dir, cb, errCb);
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
    socket.on('setvolume', function(vol) {
        mpd.setVolume(vol);
    });
    socket.on('insert song', function(song) {
        mpd.addSongAtIndex(song, +lstatus.song+1, function(){ updatePlaylist(); });
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



