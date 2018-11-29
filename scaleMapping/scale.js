function newNote(musicalNote){
  level = 0
  switch(musicalNote){
    case "C2": level = 1; break;
    case "D2": level = 2; break;
    case "E2": level = 3; break;
    case "F2": level = 4; break;
    case "G2": level = 5; break;
    case "A2": level = 6; break;
    case "B2": level = 7; break;
    case "C3": level = 8; break;
  }

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
var noteTuples = []
octave = 1
letters = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

//notes = {440: "A", 550:"B" hash map
for(i=0; i<tones.length; i++){
  if(i%12 == 3)
    octave++
  noteLetter = letters[i%12] + octave
  noteTuples[i] = [noteLetter, tones[i]] // -> array di tuple [nota, frequenza] per mantenere l'ordine
  noteFreq[noteLetter] = tones[i]
}