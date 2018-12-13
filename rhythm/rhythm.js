
/*
* function called from graphics module
* return a pair values represented the duration and a note
* duration = a musical fraction in Float type
* note = an advice note to play, if this variable is null, the note can be randomic
*/
function getDurationAndNote(){
  duration = -1
  /*  assegnare una probabilità:
      ho i valori e i pesi 
      chiamo il Math.random che mi da valori da 0 a 1
      se quello che ottengo è fra x e y (rispetto alle probabilità che ho deciso) assegno il valore corrispondente
  */

  probability = Math.random() // returns a floating-point, pseudo-random number in the range 0–1 (inclusive of 0, but not 1)
  console.log(probability)
  keys = []
  for(var x in statisticalDuration){
    keys.push(x)
  }

  start = 0
  end = 0
  for(i=0; i<keys.length; i++){
    end += statisticalDuration[keys[i]]
    if(start <= probability && probability < end){
      duration = keys[i]
    }
    start += statisticalDuration[keys[i]]
  }



  /*
  * da togliere e implementare
  */
  if(duration == "pattern")
    duration = "1/4"
  return [parseFloat(duration), null]
}

// grammar of duration of note and their relative probability (narmalised to 1)
statisticalDuration = []
statisticalDuration[1/4] = 0.3
statisticalDuration[1/8] = 0.2
statisticalDuration[1/16] = 0.02

statisticalDuration[3/8] = 0.1
statisticalDuration[2/4] = 0.08
statisticalDuration[3/4] = 0.05
statisticalDuration[4/4] = 0.05

statisticalDuration["pattern"] = 0.2
