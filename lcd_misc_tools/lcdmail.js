#!/usr/bin/env nodejs
// http://lcdproc.omnipotent.net/download/netstuff.txt

var LcdClient = require('../node_modules/lcdclient'),
    Imap = require('imap'),
    inspect = require('util').inspect,
    exec = require('child_process').exec;

var lcd = new LcdClient(13666, '127.0.0.1', "lcdMail", function() {
    lcd.debug = true;
    exec("sudo ./beep 500");
    
    lcd.screen_add("lcd-mail");
    lcd.lcd_send("screen_set "+lcd.screen+" -priority 1");
    lcd.widget_add("header", "title");
    lcd.widget_set("header", ["Started"]);
    lcd.widget_add("mailName", "string");
    lcd.widget_set("mailName", [1, 2, " IMAP listener"]);

    timedRemoveScreen(lcd.screen, 1000);
});

function timedRemoveScreen(screenName, timer) {
    setTimeout(function() {
        lcd.screen=screenName; lcd.screen_del();
    }, timer);
}

lcd.socket.on('line', function(line) {
    if (line == "ignore lcd-mail") {
        lcd.screen="lcd-mail"; lcd.screen_del();
    }
    if (line == "ignore lcd-mailnum") {
        lcd.screen="lcd-mailnum"; lcd.screen_del();
    }
});

var imap = new Imap({
    user: 'mailbox@max-weller.de',
    password: 'xMw30601',
    host: 'secure.teamwiki.net',
    port: 143,
    tls: false,
    tlsOptions: { rejectUnauthorized: false },
    //debug:console.log
});

imap.on('error', function(err) { console.log("IMAP error:",err); });
var mbox;

imap.connect(function(err) {
    if(err)console.log("IMAP connect error:",err);

    imap.openBox('INBOX', true, function(err,box){mbox=box; if(err) console.log("open INBOX error:",err,box);});


    imap.on("mail", function(newMsgs) {
        console.log("new mail", newMsgs);
        //lcd.screen_add("lcd-mailnum");
        //lcd.lcd_command("screen_set", [this.screen, 1, this.screen, 350]);
        
        
        lcd.screen_add("lcd-mail");
        lcd.lcd_send("screen_set "+lcd.screen+" -priority 1");
        timedRemoveScreen(lcd.screen, 8000);
        lcd.widget_add("header", "title");
        lcd.widget_set("header", ["New Mail"]);
        exec("./beep.sh");
        getNewestMessage(function(hdrs) {
            lcd.widget_add("mailName", "scroller");
            lcd.widget_set("mailName", [1, 2, 16, 4, 'v', 4, hdrs.from + "  :  "+hdrs.subject]);
        });
    });
});

function getNewestMessage(cb) {
  imap.seq.fetch(mbox.messages.total + ':*', { struct: false },
    { headers: ['from', 'subject'],
      body: true,
      cb: function(fetch) {
        fetch.on('message', function(msg) {
          console.log('Saw message no. ' + msg.seqno);
          var body = '';
          msg.on('headers', function(hdrs) {
            cb(hdrs);
          });
        });
      }
    }, function(err) {
      if (err) throw err;
      console.log('Done fetching all messages!');
      imap.logout();
    }
  );

}

