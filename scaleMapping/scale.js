var noteReference = "C3"
var scaleReference = scaleToStepsArray["ionian"]
var currentScale = getCurrentScale()

/*
* this function is called from the pitchDetector Module when a new note is detected
* musicalNote = a note with its octave: ex C#3
*/function newNote(musicalNote){
  	level = 0

  	switch(musicalNote){
    case currentScale[0]: level = 1; break;
    case currentScale[1]: level = 2; break;
    case currentScale[2]: level = 3; break;
    case currentScale[3]: level = 4; break;
    case currentScale[4]: level = 5; break;
    case currentScale[5]: level = 6; break;
    case currentScale[6]: level = 7; break;
    case currentScale[7]: level = 8; break;
    default: level = 0; break;
  	}

    //console.log(musicalNote)
    //console.log(level)

  	//CALL graphicsModule
  	jumpAtLevel(level)
}

//calucate the current scale based on the note and scale reference in setting
function getCurrentScale(){
    currentScale =[]
    index=0
    extractLetterReference = noteReference.substring(0, noteReference.length-1)
    extractOctaveReference = parseInt(noteReference.substring(noteReference.length-1))

    // calculate the scale
    j=letters.indexOf(extractLetterReference)
    for(i=0; i<scaleReference.length; i++){
      if(scaleReference[i]==1){
        currentScale[index] = letters[j]
        index++
      }
      j++
      if(j%12==0)
        j=0
    }


    // update the correct octave
    changeOctave = false
    currentScale[0] += extractOctaveReference
    for(i=1; i<currentScale.length; i++){
      if((currentScale[i] == "C" || currentScale[i] == "C#") && !changeOctave){
        extractOctaveReference++
        changeOctave = true
      }
      currentScale[i] += extractOctaveReference
    }

    return currentScale;

}

/* function called from Graphics module
* numLevelGame is in the range [0 - 6]
*/
function changeGameLevel(numLevelGame){
  if(numLevelGame < gameLevelToScaleArray.length)
    scaleReference = scaleToStepsArray[gameLevelToScaleArray[numLevelGame]]
  //levelScaleColorsMatrix[numLevelGame][1]
  currentScale = getCurrentScale()
}

function changeNoteReference(note){
	noteReference = note;
  currentScale = getCurrentScale()
}

function changeScaleReference(scale){
  scaleReference = scale;
  currentScale = getCurrentScale()
}

function buttonPlayReference(){
	ctx = new AudioContext()
	osc = ctx.createOscillator()
	g = ctx.createGain()
	osc.frequency.value = noteFreq[noteReference]
	osc.connect(g)
	g.connect(ctx.destination)
	g.gain.value = 0
  now = ctx.currentTime
	g.gain.linearRampToValueAtTime(1, now+0.1)
	
	g.gain.linearRampToValueAtTime(0, now+0.8)
	osc.start()
	

}