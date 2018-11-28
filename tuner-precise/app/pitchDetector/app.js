const Application = function() {
  this.tuner = new Tuner()
  this.notes = new Notes('.notes', this.tuner)
  this.update({ name: 'A', frequency: 440, octave: 4, value: 69, cents: 0 })
}

Application.prototype.start = function() {
  const self = this

  this.tuner.onNoteDetected = function(note) {
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name) {
        self.update(note)

      } else {
        self.lastNote = note.name
        console.log(self.lastNote)
        //WHERE CHANGE THE OCTAVE ? 
      }
    }
  }

  self.tuner.init()
  self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount)
}


Application.prototype.update = function(note) {
  this.notes.update(note)
  //this.meter.update((note.cents / 50) * 45)
}

// noinspection JSUnusedGlobalSymbols
Application.prototype.toggleAutoMode = function() {
  this.notes.toggleAutoMode()
}

//-----------------------------------------------------------------
// INIZIALIZE ALL PITCH DETECTOR
const app = new Application()
app.start()