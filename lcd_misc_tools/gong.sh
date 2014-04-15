#!/bin/bash

x=`date +"%I"`
echo Beim Gongschlag ist es $x Uhr

sudo ./beep 555 20
sudo ./beep 777 100
sudo ./beep 555 20
sleep 1


while [ $x -gt 0 ] ; do
  #echo "Welcome $x times"
  sudo ./beep 8888 520
  sleep 0.35
  x=$(( $x - 1 ))
done

omxplayer hourlychimebeg.mp3

