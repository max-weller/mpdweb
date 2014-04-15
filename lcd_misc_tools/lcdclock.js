#!/usr/bin/env nodejs
// http://lcdproc.omnipotent.net/download/netstuff.txt

var LcdClient = require('../node_modules/lcdclient'),
    Lirc = require('../node_modules/lirc_listener'),
    Imap = require('imap'),
    inspect = require('util').inspect,
    exec = require('child_process').exec;

var lirc = Lirc();

var lcd = new LcdClient(13666, '127.0.0.1', "lcdClock", function() {
    //lcd.debug = true;
    console.log("clock running");
    
    lcd.screen_add("clock");
    lcd.lcd_send("screen_set clock -priority info");
    lcd.widget_add("t1", "num");
    lcd.widget_add("t2", "num");
    lcd.widget_add("t3", "num");
    lcd.widget_add("t4", "num");
    lcd.widget_add("colon", "num");
    lcd.lcd_command("client_add_key", ["-shared", "enter"])
});

lirc.on('lirckey', function(d) {
    switch(d[2]) {
      case "preview":
        lcd.lcd_send("screen_set clock -priority alert");
        setTimeout(function() { lcd.lcd_send("screen_set clock -priority info"); }, 2500);
        break;
      case ""
    }
});

var colon = true;
setInterval(function() {
    lcd.screen = "clock";
    var tim = new Date(), 
      hh = Math.floor(tim.getHours() / 10), h = tim.getHours() % 10,
      mm = Math.floor(tim.getMinutes() / 10), m = tim.getMinutes() % 10;

    if (tim.getMinutes() == 0 && tim.getSeconds () == 0) {
        lcd.lcd_send("screen_set clock -priority alert");
        if (tim.getHours() > 8) exec("./gong.sh");
    }
    if (tim.getMinutes() == 1 && tim.getSeconds () < 5) {
        lcd.lcd_send("screen_set clock -priority info");
    }
    
    lcd.widget_set("t1", [1, hh]);
    lcd.widget_set("t2", [4, h]);
    lcd.widget_set("t3", [10, mm]);
    lcd.widget_set("t4", [14, m]);
    lcd.widget_set("colon", [colon?8:0, 10]);
    colon=!colon;
}, 1000);
