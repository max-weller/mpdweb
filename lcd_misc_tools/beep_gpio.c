#include <stdio.h>
#include <stdlib.h>
#include <wiringPi.h>

// http://cs.smith.edu/dftwiki/images/thumb/b/bc/RaspberryPi_GIP_WiringPi_pinout.jpg/400px-RaspberryPi_GIP_WiringPi_pinout.jpg

#define SPEAKER_PIN	1

void usage(int argc, char* argv[]) {
	fprintf(stderr, "Usage: %s frequency [duration]\n", argv[0]);
}

int main (int argc, char* argv[]) {
  if (argc < 2 || argc > 3) {
	usage(argc, argv);
	return 1;
  }
  wiringPiSetup ();
  piHiPri(99);
  pinMode(SPEAKER_PIN, OUTPUT);
  int duration, freq = atoi(argv[1]);
  printf("duration=%d, freq=%d\n", duration, freq);
  if (argc == 3) duration = atoi(argv[2])*1000; else duration = 100000;
  duration /= (2 * freq);
  printf("duration=%d, freq=%d\n", duration, freq);
  //freq *= 1000;
  int c = 0;
  while(c++ < duration) {
    digitalWrite(SPEAKER_PIN, LOW);
    usleep(freq);
    digitalWrite(SPEAKER_PIN, HIGH);
    usleep(freq);
  }
  
}
