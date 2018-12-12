


/*
* this function is called from the pitchDetector Module when a new note is detected
*/function newNote(musicalNote){
  	level = 0
  	
  	switch(musicalNote){
    case "C3": level = 1; break;
    case "D3": level = 2; break;
    case "E3": level = 3; break;
    case "F3": level = 4; break;
    case "G3": level = 5; break;
    case "A3": level = 6; break;
    case "B3": level = 7; break;
    case "C4": level = 8; break;
  	}
  	//CALL graphicsModule
  	jumpLevel(level)
}






//------------------------------------------
// function for debug

function changeReference(note){
	NoteReference = note;
}

function buttonPlayReference(){
	ctx = new AudioContext()
	osc = ctx.createOscillator()
	g = ctx.createGain()
	osc.frequency.value = noteFreq[NoteReference]
	osc.connect(g)
	g.connect(ctx.destination)
	g.gain.value = 0
    now = ctx.currentTime
  	g.gain.linearRampToValueAtTime(1, now+0.1)
  	
  	g.gain.linearRampToValueAtTime(0, now+0.8)
  	osc.start()
  	

}