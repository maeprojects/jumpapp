function newNote(musicalNote){
  level = 0
  switch(musicalNote){
    case "A2": level = 1; break;
    case "B2": level = 2; break;
    case "C#3": level = 3; break;
    case "D3": level = 4; break;
    case "E3": level = 5; break;
    case "F#3": level = 6; break;
    case "G#3": level = 7; break;
    case "A3": level = 8; break;
  }

  //CALL graphicsModule
  jumpLevel(level)
}