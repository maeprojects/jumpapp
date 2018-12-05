/*
* this function is called from the pitchDetector Module when a new note is detected
*/function newNote(musicalNote){
	console.log(musicalNote)
  	level = 0
  	
  	switch(musicalNote){
    case "A3": level = 1; break;
    case "B3": level = 2; break;
    case "C#3": level = 3; break;
    case "D3": level = 4; break;
    case "E3": level = 5; break;
    case "F#3": level = 6; break;
    case "G#3": level = 7; break;
    case "A4": level = 8; break;
  	}
	console.log(level)
  	//CALL graphicsModule
  	jumpLevel(level)
}

// calulate tones from C2 to A5
numTones = 49
var tones = []
for(i=0; i<numTones; i++){
  freq = 55*Math.pow(2,1/12)**i
  tones[i] = Number(Math.round(freq+'e2')+'e-2'); // round at second decimals
}


var noteFreq = []  //array with the notation note as index and the relative frequency as value
octave = 1
letters = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

for(i=0; i<tones.length; i++){
  if(i%12 == 3)
    octave++
  noteLetter = letters[i%12] + octave
  noteFreq[noteLetter] = tones[i]
}

var majorScale = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
var NoteReference = "C3"