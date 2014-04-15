#!/usr/bin/env nodejs
// http://lcdproc.omnipotent.net/download/netstuff.txt

var LcdClient = require('../node_modules/lcdclient'),
    Lirc = require('../node_modules/lirc_listener'),
    exec = require('child_process').exec;

var lcd = new LcdClient(13666, '127.0.0.1', "lcdClock", function() {
    //lcd.debug = true;
    
});

var lirc = Lirc();
lirc.on('lirckey', function(data) {
    var keyCode = data[2];
    
    lcd.screen_add("on-key");
    lcd.lcd_send('screen_set on-key -priority alert');
    lcd.widget_add("title", "title");
    lcd.widget_set("title", ["LIRC Key"]);
    lcd.widget_add("key", "string");
    lcd.widget_set("key", [1, 2, keyCode]);
    setTimeout(function() { lcd.screen_del(); }, 1000);

    exec("sudo ./beep 5000 200");
});
