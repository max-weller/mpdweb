#!/usr/bin/env nodejs
// http://lcdproc.omnipotent.net/download/netstuff.txt

var mpdconnector = require('./mpdconnector'),
    net = require('net'),
    LcdClient = require('../node_modules/lcdclient'),
    Lirc = require('../node_modules/lirc_listener')
    exec = require('child_process').exec;

var mpd = mpdconnector('127.0.0.1' , 6600);

var lirc = Lirc();

lirc.on('lirckey', function(d) {
    switch(d[2]) {
    case "vol-": case "vol+": case "mute":
        showVolScreen();
        break;
    case "skipr": case "reward":
        mpd.previous(); lcd.lcd_send("screen_set mpd_current_song -priority input");
        break;
    case "skipf": case "forward":
        mpd.next(); lcd.lcd_send("screen_set mpd_current_song -priority input");
        break;
    case "play":
        mpd.play(); lcd.lcd_send("screen_set mpd_current_song -priority input");
        break;
    case "pause":
        mpd.pause(); lcd.lcd_send("screen_set mpd_current_song -priority input");
        break;
    case "stop":
        mpd.stop();
        break;
    }
});

var lcd = new LcdClient(13666, '127.0.0.1', 'mpd-adapter', function(sock) {
    
    lcd.lcd_send("screen_add mpd_current_song");
    //lcd_send("widget_add mpd_current_song header title");
    //lcd_send('widget_set mpd_current_song header "Now playing"');

    lcd.lcd_send("widget_add mpd_current_song title scroller");
    lcd.lcd_send("widget_add mpd_current_song artist string");
    lcd.lcd_send("widget_add mpd_current_song timer string");
    lcd.lcd_send("widget_add mpd_current_song progress hbar");
});


mpd.connect();

setInterval(function() {
    mpd.getStatus(function(result) {
        // console.log(result);
        if (result.state == "stop") {
            lcd.lcd_send("screen_set mpd_current_song -priority background");
        } else {
            lcd.lcd_send("screen_set mpd_current_song -priority foreground");
        }
        lcd.lcd_send("widget_set mpd_current_song artist 1 1 \""+ result.currentsong.artist +"\"");
        lcd.lcd_send("widget_set mpd_current_song title 1 2 16 2 h 3 \""+ result.currentsong.title +"\"");
        try{
            var tim = result.time.split(/:/);
            var ela = formatTime(tim[0]), len = formatTime(tim[1]);
            lcd.lcd_send("widget_set mpd_current_song timer 1 3 \""+ ela + " / " + len + "  " + (result.state=="pause"?"P":"") + "\"");
            lcd.lcd_send("widget_set mpd_current_song progress 1 4 "+ (tim[0] / tim[1] * 80) +"");
        }catch(e) {
            lcd.lcd_send("widget_set mpd_current_song timer 1 3 \"gestoppt\"");
        }
    }, function(err) {
        console.log("error: "+err);
    });
}, 1000);

function formatTime(sec) {
  return "" + Math.floor(sec / 60) + ":" + ("00"  + Math.floor(sec % 60)).substr(-2);
}

var volScreenHideTimeout;
function showVolScreen() {
    setTimeout(function() {
        lcd.screen_add("volume");
        lcd.lcd_send("screen_set volume -priority alert");
        lcd.widget_title("Volume");
        lcd.widget_add("voltxt", "string");
        lcd.widget_add("volp", "hbar");
        exec('amixer get Master', function(err, stdout, stderr) {
            if(err) console.log("ERROR amixer result", err, stdout);
            var m = stdout.match(/([0-9]+)%/);
            console.log("volume", m[0]);
            lcd.widget_set("voltxt", [1, 2, m[0]]);
            lcd.widget_set("volp", [1, 4, m[1]/100*80]);
        });
        if(volScreenHideTimeout) clearTimeout(volScreenHideTimeout);
        volScreenHideTimeout=setTimeout(function() {
            lcd.screen="volume"; lcd.screen_del();
        }, 2500);
    }, 500);
}



/**
 * By TooTallNate, originally posted at https://gist.github.com/1785026
 * A quick little thingy that takes a Stream instance and makes
 * it emit 'line' events when a newline is encountered.
 *
 *   Usage:
 *   ‾‾‾‾‾
 *  emitLines(process.stdin)
 *  process.stdin.resume()
 *  process.stdin.setEncoding('utf8')
 *  process.stdin.on('line', function (line) {
 *    console.log(line event:', line)
 *  })
 *
 */

function emitLines (stream, lineFeedChar) {
  var backlog = ''
  stream.on('data', function (data) {
    console.log("- data in "+data.length+" bytes");
    backlog += data
    var n = backlog.indexOf(lineFeedChar)
    // got a \n? emit one or more 'line' events
    while (~n) {
      stream.emit('line', backlog.substring(0, n))
      backlog = backlog.substring(n + 1)
      n = backlog.indexOf(lineFeedChar)
    }
  })
  stream.on('end', function () {
    if (backlog) {
      stream.emit('line', backlog)
    }
  })
}


