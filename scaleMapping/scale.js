var noteReference = "C3"
var scaleStepsReference = scaleToStepsArray["ionian"]
var currentScale = getScale(scaleStepsReference, noteReference)


// convert a musical note (ex "A#3") to a level between 1 - 8 (the diatonic interval)
// if return 0 means the musical note is not in the current scale
function convertNoteToLevel(note){
  switch(note){
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
  return level
}

// convert a level between 1 - 8 (the diatonic interval, ex 3) to a musical note 
// if return 0 means the level is not in the current scale
function convertLevelToNote(level){
  switch(level){
  case 1: note = currentScale[0]; break;
  case 2: note = currentScale[1]; break;
  case 3: note = currentScale[2]; break;
  case 4: note = currentScale[3]; break;
  case 5: note = currentScale[4]; break;
  case 6: note = currentScale[5]; break;
  case 7: note = currentScale[6]; break;
  case 8: note = currentScale[7]; break;
  default: note = 0; break;
  }
  return note
}

/*
* this function is called from the pitchDetector Module when a new note is detected
* musicalNote = a note with its octave: ex C#3
*/function newNote(musicalNote){
  	level = 0
    level = convertNoteToLevel(musicalNote)

    if(level!=0)
      console.log(musicalNote)
    //console.log(level)

  	//CALL graphicsModule
  	jumpAtLevel(level)
}

//calucate the current scale based on the note and scale reference in setting
function getScale(scaleStep, fundamental){
    currentScale =[]
    index=0
    extractLetterReference = fundamental.substring(0, fundamental.length-1)
    extractOctaveReference = parseInt(fundamental.substring(fundamental.length-1))

    // calculate the scale
    j=letters.indexOf(extractLetterReference)
    for(i=0; i<scaleStep.length; i++){
      if(scaleStep[i]==1){
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
    scaleStepsReference = scaleToStepsArray[gameLevelToScaleArray[numLevelGame]]
  else
    consolo.log("Error in parameter !")
  //levelScaleColorsMatrix[numLevelGame][1]
  currentScale = getScale(scaleStepsReference, noteReference)
}


/* function called from the Sync module
* note: is a musical note (ex A#4)
* scale: is the musical scale (ex dorian)
* gameMode: standard or progressive
*/
function setReference(note, scale){
  // set the note reference if it is correct
  if(noteFreq[note] != undefined)
    changeNoteReference(note)
  else
    console.log("Note parameter Error")

  // set the scale reference if it is correct
  if(scale.indexOf(scale) != -1)
    changeScaleReference(scale)
  else
    console.log("Scale parameter Error")
}


function changeNoteReference(note){
	noteReference = note;
  currentScale = getScale(scaleStepsReference, noteReference)
}

function changeScaleReference(scale){
  scaleStepsReference = scaleToStepsArray[scale];
  currentScale = getScale(scaleStepsReference, noteReference)
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