# JumpApp
Combined project between:  
Advanced Coding Tools and Methodologies & Computer Music - Representations and Models

## Why?
This project is based on the idea of wanting to create a fun, educational and musical game, that was available online, for free, without the need to install it on your device.  
There are several applications related to ear training, but few (or none) related to the training of the singing and therefore the relative pitch.  
JumpApp manages to do this but in the form of a game!  
You can also play with a musical instrument so as to train a "sight-reading" that frees you from the musical notation.

## Game instructions
#### Settings
Two modalities of game are available: static and progressive.  
The first one allows you to train on a specific scale that you can choose between the seven modes of the major scale.  
The second one (for the more experienced) provides a progressive increase in difficulty of the game: at each level changes the modal scale of reference with a colored match of the grid that shows how the scale has changed.  
Before starting to play, the user can decide the octave range between note C2 to B5 on which he will play.

#### Play
The game consists in jumping on each platform to avoid dropping the note.  
The platforms are arranged on eight levels corresponding to the octave of a musical scale: from the most grave to the most acute, from the bottom to the top.  
The game background has vertical lines that emphasize the beats of a time in 4/4.  
To jump the note just before it falls (so in time with the grid) you must sing the note corresponding to the next platform. In the game there can also be musical pauses identifiable by the lack of platforms, in this case you have to be silent and wait for the note to fly to the next platform to sing.

## How does it work?
The code is divided into several [modules](https://github.com/maeprojects/jumpapp/blob/release3/modulesUML.png) that cooperate together.  
  * PitchDetector
  * ScaleMapping
  * Graphics
  * Settings
  * Rhythm

The graphics module manages the graphical logic: the creation and movement of the platforms, the displacements of the note, the updating of the grid based on the level changes, the control and management of the game over. The creation of the platforms includes the rhythm module that statistically models the choice of the duration of the notes and the use of the main musical patterns.   
When the user starts playing, the pitchDetector is listening on the microphone of the device and as soon as a change of pitch is detected it calculates the note detected and sends it to the scaleMapping module which compares the note played with the current musical scale of the game. Then the scaleMapping module sends a message to the graphics module: if the note is part of the scale it sends the platform number to which the note should jump, otherwise it sends an error. The graphics module will be able to understand if the note can jump on time in the next platform or if it will die.

## External libraries
For the JumpApp function, the following external libraries are used:
  * [Phaser3](https://phaser.io/phaser3): a framework used for managing graphics
  * [AubioJS](https://github.com/qiuxiang/aubiojs): a translate version of the python [aubio](https://aubio.org) library in JavaScript used for the pitch detection
  * [Audiosynth](https://github.com/keithwhor/audiosynth): a dynamic waveform audio synthesizer used for the sound reproduction

## Demo
(add reference link)
You can see a small [video demonstration of the game]() or the [complete version](https://jumpapp.surge.sh) where you can play.
#### Enjoy your time!

Copyright © 2019 - Olivieri · Simeon - all rights reserved.


