#!/usr/bin/env nodejs
// http://lcdproc.omnipotent.net/download/netstuff.txt

var LcdClient = require('../node_modules/lcdclient'),
    inspect = require('util').inspect,
    exec = require('child_process').exec;

var ip_to_disp = process.env.ip_address;

if (!ip_to_disp) 

var lcd = new LcdClient(13666, '127.0.0.1', "lcdAlert", function() {
    //lcd.debug = true;

    	lcd.screen_add("alertbox-ip");
    	lcd.lcd_send("screen_set alertbox-ip -priority 1");
	lcd.widget_add("header", "title");
        lcd.widget_set("header", ["IP Address"]);
        exec("./beep.sh");
        lcd.widget_add("mailName", "scroller");
        lcd.widget_set("mailName", [1, 2, 16, 4, 'v', 4, process.env.ip_address]);
	setTimeout(function() {
		lcd.screen_del();
		process.exit(0);
	}, 3000);
});

