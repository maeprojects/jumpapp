var majorScale = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
var NoteReference = "C3"

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

red = "0xff6b63";
white = "0xffffff";
blue = "0x999cff";
pink = "0xffc2bf";
lightRed = "0xff9993";
yellow = "0xebff96";

//ternary mapping
var levelScaleColorsMatrix = [["ionian",[1,0,1,0,1,1,0,1,0,1,0,1,1],[red, white, pink, white, lightRed, white, white, red]], 
		["lydian",[1,0,1,0,1,0,1,1,0,1,0,1,1],[red, white, pink, yellow, lightRed, white, white, red]], 
		["mixolydian",[1,0,1,0,1,1,0,1,0,1,1,0,1],[red, white, pink, white, lightRed, white, blue, red]], 
		["dorian",[1,0,1,1,0,1,0,1,0,1,1,0,1],[red, white, blue, white, lightRed, white, blue, red]],
		["eolian",[1,0,1,1,0,1,0,1,1,0,1,0,1],[red, white, blue, white, lightRed, blue, blue, red]],
		["phrigian",[1,1,0,1,0,1,0,1,1,0,1,0,1],[red, blue, blue, white, lightRed, blue, blue, red]],
		["locryan",[1,1,0,1,0,1,1,0,1,0,1,0,1],[red, blue, blue, white, blue, blue, blue, red]]]





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