const PitchDetector = function() {
  this.tuner = new Tuner()
  this.notes = new Notes('.notes', this.tuner)
  //this.update({ name: 'A', frequency: 440, octave: 4, value: 69, cents: 0 })
}

PitchDetector.prototype.start = function() {
  const self = this

  this.tuner.onNoteDetected = function(note) {
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name && self.lastOctave === note.octave) {
        //self.update(note)

      } else {
        self.lastNote = note.name
        self.lastOctave = note.octave
        
        musicalNote = note.name + note.octave

        //console.log(musicalNote)
        // CALL ScaleCorrelation Module
        newNote(musicalNote)
      }
    }
  }

  self.tuner.init()
  self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount)
}

/*
PitchDetector.prototype.update = function(note) {
  //this.notes.update(note)
  //this.meter.update((note.cents / 50) * 45)
}*/

// enable or disable the detection
PitchDetector.prototype.toggleEnable = function() {
  this.notes.toggleAutoMode()
}

PitchDetector.prototype.isEnable = function() {
  return this.notes.isAutoMode
}

// this method is for the upgrade of AudioContext (December 2018)
PitchDetector.prototype.resumeAudioContext = function() {
  this.tuner.audioContext.resume()
}

//-----------------------------------------------------------------
// INIZIALIZE ALL PITCH DETECTOR
//const pitchDetector = new PitchDetector()
//pitchDetector.start()