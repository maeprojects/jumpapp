
// calulate tones from C2 to A5
var noteFreq = []  //array with the notation note as index and the relative frequency as value
numTones = 49
var tones = []
for(i=0; i<numTones; i++){
  freq = 55*Math.pow(2,1/12)**i
  tones[i] = Number(Math.round(freq+'e2')+'e-2'); // round at second decimals
}

octave = 1
letters = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

for(i=0; i<tones.length; i++){
  if(i%12 == 3)
    octave++
  noteLetter = letters[i%12] + octave
  noteFreq[noteLetter] = tones[i]
}

// --------------------------------------------------------------------------

// intervals colors
fundamental = "0xff6b63"; //red
majorThird = "0xffc2bf";  //pink
perfectFifth = "0xff9993";  //light-red
augFourth = "0xebff96"; //yellow
majorInt = "0xffffff";  //majorIntC
minorInt = "0x999cff";  //blue

//ternary mapping
/*
var levelScaleColorsMatrix = [["ionian",[1,0,1,0,1,1,0,1,0,1,0,1,1],[fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, majorInt, fundamental]], 
		["lydian",[1,0,1,0,1,0,1,1,0,1,0,1,1],[fundamental, majorInt, majorThird, augFourth, perfectFifth, majorInt, majorInt, fundamental]], 
		["mixolydian",[1,0,1,0,1,1,0,1,0,1,1,0,1],[fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, minorInt, fundamental]], 
		["dorian",[1,0,1,1,0,1,0,1,0,1,1,0,1],[fundamental, majorInt, minorInt, majorInt, perfectFifth, majorInt, minorInt, fundamental]],
		["eolian",[1,0,1,1,0,1,0,1,1,0,1,0,1],[fundamental, majorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]],
		["phrigian",[1,1,0,1,0,1,0,1,1,0,1,0,1],[fundamental, minorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]],
		["locryan",[1,1,0,1,0,1,1,0,1,0,1,0,1],[fundamental, minorInt, minorInt, majorInt, minorInt, minorInt, minorInt, fundamental]]]
		*/

var scaleToStepsArray=[]
scaleToStepsArray["ionian"] = [1,0,1,0,1,1,0,1,0,1,0,1,1]
scaleToStepsArray["lydian"] = [1,0,1,0,1,0,1,1,0,1,0,1,1]
scaleToStepsArray["mixolydian"] = [1,0,1,0,1,1,0,1,0,1,1,0,1]
scaleToStepsArray["dorian"] = [1,0,1,1,0,1,0,1,0,1,1,0,1]
scaleToStepsArray["aeolian"] = [1,0,1,1,0,1,0,1,1,0,1,0,1]
scaleToStepsArray["phrygian"] = [1,1,0,1,0,1,0,1,1,0,1,0,1]
scaleToStepsArray["locrian"] = [1,1,0,1,0,1,1,0,1,0,1,0,1]

var scaleToColorsArray = []
scaleToColorsArray["ionian"] = [fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, majorInt, fundamental]
scaleToColorsArray["lydian"] = [fundamental, majorInt, majorThird, augFourth, perfectFifth, majorInt, majorInt, fundamental]
scaleToColorsArray["mixolydian"] = [fundamental, majorInt, majorThird, majorInt, perfectFifth, majorInt, minorInt, fundamental]
scaleToColorsArray["dorian"] = [fundamental, majorInt, minorInt, majorInt, perfectFifth, majorInt, minorInt, fundamental]
scaleToColorsArray["aeolian"] = [fundamental, majorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]
scaleToColorsArray["phrygian"] = [fundamental, minorInt, minorInt, majorInt, perfectFifth, minorInt, minorInt, fundamental]
scaleToColorsArray["locrian"] = [fundamental, minorInt, minorInt, majorInt, minorInt, minorInt, minorInt, fundamental]

var gameLevelToScaleArray = []
gameLevelToScaleArray[0] = "ionian"
gameLevelToScaleArray[1] = "lydian"
gameLevelToScaleArray[2] = "mixolydian"
gameLevelToScaleArray[3] = "dorian"
gameLevelToScaleArray[4] = "aeolian"
gameLevelToScaleArray[5] = "phrygian"
gameLevelToScaleArray[6] = "locrian"

var scales = gameLevelToScaleArray // to have the scales name of the modes

var GAME_MODE = {
  STANDARD: 1,
  PROGRESSIVE: 2
};

//-------------------------------------------------------------------------------------------
/*
* Useful methods to reproduce sounds (notes, scales, ...)
* It use an external library "AudioSynth"
* Reference: http://keithwhor.github.io/audiosynth/
*/

Synth instanceof AudioSynth; // true
Synth.setVolume(0.8)
var pianoInstrument = Synth.createInstrument('piano');
var lastNoteToPlayed = ""

// note is a musical note (ex C#5)
// durationSingleNote is in seconds
function playNote(note, duration){
  // example:
  // piano.play('C', 4, 2); -> plays C4 for 2s using the 'piano' sound profile
  name = note.substring(0,note.length-1)
  octave = note.substring(note.length-1, note.length)
  d = Math.abs(duration)
  
  if(game.scene.isActive("playScene") || gameStatus=="Gameover"){
    pianoInstrument.play(name, octave, d)

    if(scaleOnPlay && note == stepScale[stepScale.length-1]){ //check if i was playing a scale and to manage the pause
      scaleOnPlay = false
    }
  }
  else {
    if(lastNoteToPlayed == ""){
      lastNoteToPlayed = note
    }
  }

}

// play a level of the gameGrid: based on the currentScale and the current noteReference
function playLevel(level){
  if(level > 0 && level < 9)
  note = currentScale[level-1]
  playNote(note, 1) // play note with 1 sec of duration
}

// scale is the name scale to play (ex dorian)
// fundamental is the starting note to play the specific scale (ex C#5)
// durationSingleNote is in seconds
// -> this method manage if during the play of one scale the player put on pause the game. then restard from the previous note
var indexNote = 0
var scaleOnPlay = false


function playScale(scale, fundamental, durationSingleNote){
  scaleOnPlay = true
  stepScale = getScale(scaleToStepsArray[scale], fundamental) //return in form of ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]
  d = Math.abs(durationSingleNote)
  //console.log(d)
  //indexNote = 0
  shiftTime = 0   // in order to set the delay time of the timeout
  if(lastNoteToPlayed != ""){
    indexNote = stepScale.indexOf(lastNoteToPlayed)
    lastNoteToPlayed = ""
  }

  for(indexNote; indexNote<stepScale.length && game.scene.isActive("playScene"); indexNote++){
    console.log("CICLO")
    note = stepScale[indexNote]
    setTimeout(playNote, d*shiftTime*1000, note, d*2) // call playNote(note, d) after d/2 second (scanning the scale)
    shiftTime++
  }

}





