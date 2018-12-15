
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




