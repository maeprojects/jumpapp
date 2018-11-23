// Copyright © 2018, Olivieri Marco – All rights reserved

// get the stream from the mic of the device: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

// transform a stream into a node that i can process: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource

var canvas = document.querySelector("#canvas");
var maxLabel = document.querySelector("#max");
var indexLabel = document.querySelector("#index");
var freqLabel = document.querySelector("#freq");
var logLabel = document.querySelector("#log");
var noteLabel = document.querySelector("#note");
var ctx = canvas.getContext("2d")

var requestAnimation = true

var minVoiceFrequency = 69 // C2
var maxVoiceFrequency = 880 // A5
var threshold = 80 // percentage of the threshold

//------------------------------------------------
// set of NOTES

// calulate tones from C2 to A5
numTones = 49
var tones = []
for(i=0; i<numTones; i++){
  freq = 55*Math.pow(2,1/12)**i
  tones[i] = Number(Math.round(freq+'e2')+'e-2'); // round at second decimals
}


var freqNotes = []  //array with the notation note as index and the relative frequency as value
octave = 1
letters = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
for(i=0; i<tones.length; i++){
  if(i%12 == 3)
    octave++
  noteLetter = letters[i%12] + octave
  freqNotes[noteLetter] = tones[i]
}

//------------------------------------------------
// Audio Node
var c = new AudioContext();
var analyser = c.createAnalyser();
console.log("SampleRate: " + c.sampleRate)


//------------------------------------------------
// analyser node settings
var fftSize = 2048 * 4
analyser.fftSize = fftSize; // window size in sample
var bufferLength = analyser.frequencyBinCount;
//console.log(bufferLength)
var dataArray = new Uint8Array(bufferLength);
//analyser.connect(c.destination);

//------------------------------------------------
//sampling
nyquistFreq = c.sampleRate / 2
var bandwidth = nyquistFreq / bufferLength
console.log("bandwidthElement = " + bandwidth)


//------------------------------------------------
// get stream audio from mic device
navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
  source = c.createMediaStreamSource(stream);
  source.connect(analyser)
})


//------------------------------------------------
//draw
function drawSamples()
{
  analyser.getByteFrequencyData(dataArray); // fill the Uint8Array with data returned from getByteFrequencyData()
  //analyser.getByteTimeDomainData(dataArray)
  dataArray = windowing(dataArray)
  var peaksArray = searchPeaks(dataArray)
  pitch(peaksArray, dataArray)
  
  //console.log(peaksArray.length)
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.beginPath();
  for(var i=0; i<canvas.width;i++) {
    //ctx.lineTo(i,canvas.height - dataArray[i]);
    //ctx.fillRect(i*6,canvas.height - dataArray[i],5, canvas.height);
    ctx.fillRect(i*3,canvas.height - dataArray[i],2, canvas.height);
    ctx.fillStyle="rgba(200,0,0," + dataArray[i]/300 +")"
    
    
  }
  ctx.stroke();
  
  var max = Math.max(...dataArray) // find max in the current dataArray
  var index = dataArray.indexOf(max)
  var fromFreq = index*bandwidth
  var toFreq = fromFreq+bandwidth
  note = getNote(fromFreq, toFreq)
  
  maxLabel.textContent =  "Max = " + max 
  indexLabel.textContent = "Index = " + index
  freqLabel.textContent = "Freq = " + fromFreq + " - " + toFreq
  logLabel.textContent = "Array length = " + dataArray.length
  noteLabel.textContent = "Note = " + note
  
  if(peaksArray.length > 0)
    console.log(peaksArray)
  
  if(requestAnimation)
    requestAnimationFrame(drawSamples);
}
drawSamples();

// this function performs a windowing in the spectrum based on the min and max voice frequency
function windowing(array){
  for(i=0; i<minVoiceFrequency/bandwidth; i++)
    array[i] = 0
  for(i=Math.floor(maxVoiceFrequency/bandwidth); i<array.length; i++)
    array[i] = 0
  return array
}


// this searches the peaks of frequencies major than a threshold
function searchPeaks(array){
  var peaks = []
  //it searches peaks into the previous windowing, it stores the peaks indexes
  j = 0
  for(i=Math.floor(minVoiceFrequency/bandwidth); i<maxVoiceFrequency/bandwidth; i++){
    if(array[i] > (256 * (threshold / 100)) ){
      peaks[j] = i
      j++
    }
  }
  return peaks
}

//logic: ordina gli indici dal picco con più energia a quello con meno energia
function pitch(peaksIndex, frequencies){
  //select the freq of the peaks
  array = []
  for(i=0; i<peaksIndex.length; i++){
    array[i] = dataArray[peaksIndex[i]]
  }
  //order the freq
  var sorted = array.sort()
  
  //order the peak indexes (in order ascendent)
  for(i=0; i<peaksIndex.length; i++){
    peaksIndex[i] = dataArray.indexOf(sorted[i])
  }
  
  //now peaksIndex has the indexes order from minFreq to maxFreq
  
  console.log("Index")
  console.log(peaksIndex)
}

// searchs the correspondent note from a specific bandwidth
// idea: simil dicotomic search in the noteFreq array through the bandwidth
function getNote(fromFreq, toFreq){

  return "0"
}


// function called by the button to stop the image
function pause(){
  if(requestAnimation)
    requestAnimation = false
  else{
    requestAnimation = true
    drawSamples()
  }
}