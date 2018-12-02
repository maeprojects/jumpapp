//Settings
var resolution = [window.innerWidth, window.innerHeight]
var gravity = 850;
var playerGravity = 400;
var gameVelocity = 1;
var numberOfLevels = 8;
var backgroundGridColor = 0xffe8e8;
var backgroundColor = 0xFFFFFF;
var platformColor = 0xed4747;
var fontSize = '20px';
var fontColor = '#F00';



//Game Configuration
var config = {
	type: Phaser.AUTO,
	width: resolution[0],
	height: resolution[1],
	backgroundColor: backgroundColor,
	physics: {
		default: 'arcade',
		arcade: {
				gravity: { y: gravity },
				debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var game = new Phaser.Game(config);

//GAME VARIABLES

//Player object, player dimension
var player;
var playerWidth;
var playerHeight;

//Game score
var score; //Int
var scoreText;
	
//Game state managing (booleans)
var gameOver;
var restartScene;
var startedGame;
var pausedGame;
var sceneCreated;

//Jump event managing
var goAhead;
var correctAnswer;
var jumpArea;
var jumpAreaWidth;

//Player position
var playerFixedX;
var playerInitialY;

//Platforms (levels)
var levelsFieldHeight;
var stepHeight;
var platformVelocity;
var platformTouched;
var platformWidth;
var platformHeight;
var platformInitialX;
var nextNote;
var currentNote;

//Graphic drawings object manager
var graphics;
	
//Pitch detector initialization (here to create only one object even if the game is restarted)
const pitchDetector = new PitchDetector();
pitchDetector.start();


function initVariables() {
	//Game score
	score = 0;
	
	//Game state managing
	gameOver = false;
	restartScene = false;
	startedGame = false;
	pausedGame = false;
	sceneCreated = false;
	
	//Jump event managing
	goAhead = true;
	correctAnswer = true;
	jumpArea = false;
	jumpAreaWidth = playerWidth+30*gameVelocity;
	
	//Player position
	playerFixedX = 200;
	playerInitialY = playerHeight/2;
	
	//Platforms (levels)
	levelsFieldHeight = resolution[1]-playerHeight*2; //Calculation of levels Field (Height of the scene in which levels can appear)
	stepHeight = levelsFieldHeight/numberOfLevels;
	platformVelocity = 0;
	platformWidth = 300;
	platformHeight = stepHeight-((stepHeight*40)/100);
	platformInitialX = (playerFixedX-playerWidth/2)+platformWidth/2;
	nextNote = 0;
	currentNote = 0;
}


function preload ()
{
	//Needed to be set here to set the player dimension correctly
	playerWidth = 32;
	playerHeight = 48;
	
	//Loading of game resources
	this.load.image('gameover', 'assets/gameover.png');
	this.load.spritesheet('player', 'assets/player.png', { frameWidth: playerWidth, frameHeight: playerHeight });
}

function createPlatformTexture(context, width, height, color= platformColor) {
	graphics=context.add.graphics();
	graphics.fillStyle(color,1);
	graphics.fillRect(0,0,width-1,height); //width-1 to see the division between two platforms at the same level
	graphics.generateTexture('platform',width,height);
	graphics.destroy();
}


function createBackground(context, color= backgroundGridColor) {
	graphics=context.add.graphics();
	
	graphics.fillStyle(color,1);
	graphics.lineStyle(3, color, 1);
	
	blackSteps = [true,false,true,false,true,false,false,true]; //From the bottom (position 0) to the top (position 7) of the screen
																//Dimension must agree with numberOfLevels
	yPointer = playerHeight; //Starts from the top to draw
	for (i = 1; i <= blackSteps.length; i++) { 
		if(blackSteps[blackSteps.length-i]) {
			graphics.fillRect(0,yPointer,resolution[0],stepHeight);
		}
		graphics.strokeRect(0,yPointer,resolution[0],stepHeight); //Rectangle border
		yPointer += stepHeight;
	}
	
	graphics.generateTexture('background',resolution[0],resolution[1]);
	
	graphics.destroy();
}


function create ()
{	
	initVariables();
	
	//WORLD
	
	//Add Background
	createBackground(this); //Draw the background texture
	this.add.image(resolution[0]/2, resolution[1]/2, 'background');
	
	//Set world bounds
	this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);
	
	//PLAYER

	player = this.physics.add.sprite(playerFixedX, playerInitialY, 'player');
	player.setCollideWorldBounds(false); //So the player can exceed the world boundaries
	player.body.setGravityY(-gravity); //For the player to have an y acceleration
	//player.setTint(0xFF0000); //Set a color mask for the player

	//Player Animations Creation
	this.anims.create({
		key: 'playerRun',
		frames: this.anims.generateFrameNumbers('player', { start: 1, end: 9 }),
		frameRate: 15*Math.sqrt(gameVelocity), //To set the veloticy of "rotation" dependent to the gameVelocity
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'playerStop',
		frames: [ { key: 'player', frame: 1 } ],
		frameRate: 2
	});
	
	//PLATFORMS GENERATION
	
	createPlatformTexture(this, platformWidth, platformHeight); //Draw the platform texture
	platforms = this.physics.add.staticGroup(); //Platforms empty group creation
	
	//Generation of the platforms visible when the game starts
	numberOfInitialPlatforms = resolution[0]/platformWidth; //Exceed the number of effectively shown platforms to avoid horizontal white spaces between platforms
	for(i=0; i<numberOfInitialPlatforms; i++) {
		newLevel = generateLevel();
		levelIndex = newLevel[0];
		levelHeight = newLevel[1];
		randomLevel = platforms.create((platformInitialX+platformWidth*i), levelHeight, 'platform');
		randomLevel.note = levelIndex;
	}
	
	//Creation of collider between the player and the platforms, with a callback function
	this.physics.add.collider(player, platforms, platformsColliderCallback);
		
	
	//SCORE
	scoreText = this.add.text(16, 16, 'score:       Enter/Space to start', { fontSize: fontSize, fill: fontColor });
	
	sceneCreated = true;
	this.scene.pause("default");
}

function update ()
{
	console.log("UPDATE");
	
	if(restartScene) {
		this.scene.restart();
		game.scene.pause("default");
		restartScene = false;
	} 
	else {
		platforms.getChildren().forEach(function(p){		
			if(p.note != undefined){
				p.x = p.x - platformVelocity;
				p.body.x = p.body.x - platformVelocity;
				if(p.x < -p.width-1000) p.destroy();
				
				playerLeftBorder = (playerFixedX-player.width/2);
				platformLeftBorder = (p.x-p.width/2);
				platformWidth = p.width;
				
				changedCurrentPlatform = platformLeftBorder >= playerLeftBorder-gameVelocity && platformLeftBorder < playerLeftBorder;
				changedNextPlatform = platformLeftBorder-platformWidth >= playerLeftBorder-gameVelocity && platformLeftBorder-platformWidth < playerLeftBorder;
				
				//Change Platform event to set nextNote
				if(changedNextPlatform) {
					nextNote = p.note;
					//console.log("Current Note: ", currentNote);
					//console.log("Next Note: ", nextNote);
				}
				
				
				
				//Current Platform Changed Event
				if(changedCurrentPlatform && !correctAnswer) { //decide if the player has to die or not, depending on correctAnswer
					goAhead = false;
				} else if(changedCurrentPlatform) { //Set currentNote
							currentNote = p.note;
							jumpArea = false;
							correctAnswer = false;
						}
				
				//jumpArea Setter when the player enter the jumpArea
				if(platformLeftBorder+platformWidth-jumpAreaWidth >= playerLeftBorder-gameVelocity && platformLeftBorder+platformWidth-jumpAreaWidth < playerLeftBorder) {
					jumpArea = true;
				}
			}
		})
		
		if(player.body.touching.down) {
			player.anims.play('playerRun', true);
			platformVelocity = gameVelocity;
			
		}	
		else {
			player.anims.play('playerStop', true);
			platformTouched = false;
		}
		
		if(randomLevel.x < resolution[0]-randomLevel.width/2){
			
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			//console.log("New level\nLevel Value: ",levelValue, "\nLevel Height: ",levelHeight)
			randomLevel = platforms.create(resolution[0]+randomLevel.width/2, levelHeight, 'platform');
			randomLevel.note = levelValue;
		}
		
		if(player.y > resolution[1]+player.height/2) {
			platformVelocity = 0;
			if(!gameOver){
				this.add.image(resolution[0]/2, resolution[1]/2, 'gameover');
				player.destroy();
				sceneCreated = false;
				console.log("sceneCreated: ",sceneCreated);
				gameOver = true;
				startedGame = false;
				//console.log("GameOver: ",gameOver);
				scoreText.setText('score: ' + score + '    Enter/Space to restart');
				if(pitchDetector.isEnable()) pitchDetector.toggleEnable();
				this.scene.pause("default");
			}
		}
		
		if(!goAhead) {
			this.physics.world.colliders.destroy();
		}
	}
}


var generateLevel = function() {
	randomLevelValue = Math.floor(Math.random()*(numberOfLevels))+1;
	currentLevelHeight = (((numberOfLevels+1)-randomLevelValue)*(levelsFieldHeight/numberOfLevels))+((levelsFieldHeight/numberOfLevels)/2)+(player.height-(levelsFieldHeight/numberOfLevels));
	console.log("New Random level: ", randomLevelValue);
	return [randomLevelValue, currentLevelHeight];
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down) {
		//console.log("Collide Event");
		score++;
		scoreText.setText('score: ' + score);
	}
	platformTouched = true;
}

document.onclick = function () {
	if(!startedGame){
		if(sceneCreated) {
			player.body.setGravityY(playerGravity);
			scoreText.setText('score: ' + score);
			startedGame = true;
			if(!pitchDetector.isEnable()) pitchDetector.toggleEnable();
		}
	} else if(!gameOver){
		pausedGame = !pausedGame;
		if(pausedGame) scoreText.setText('score: ' + score + ' Game Paused, Enter/Space to resume...');
		else scoreText.setText('score: ' + score);
		console.log("PausedGame: ",pausedGame);
		pitchDetector.toggleEnable();
		if(pausedGame) {
			game.scene.pause("default");
		}
		else game.scene.resume("default");
	}
		
	if(gameOver) {
		score = 0;
		restartScene = true;
		goAhead = true;
		//console.log("restartScene: ",restartScene);
		gameOver = false;
		//console.log("gameOver: ",gameOver);
		startedGame = false;
		//console.log("startedGame: ",startedGame);
		correctAnswer = true;
		//console.log("correctAnswer: ",correctAnswer);
		game.scene.resume("default");
	}
}

document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){
			
			if(!startedGame){
				if(sceneCreated) {
					player.body.setGravityY(playerGravity);
					scoreText.setText('score: ' + score);
					startedGame = true;
					//console.log("startedGame: ",startedGame);
					if(!pitchDetector.isEnable()) pitchDetector.toggleEnable();
					game.scene.resume("default");
				}
				
			} else if(!gameOver){
				pausedGame = !pausedGame;
				if(pausedGame) scoreText.setText('score: ' + score + ' Game Paused, Enter/Space to resume...');
				else scoreText.setText('score: ' + score);
				console.log("PausedGame: ",pausedGame);
				pitchDetector.toggleEnable();
				if(pausedGame) game.scene.pause("default");
				else game.scene.resume("default");
			}
				
			if(gameOver) {
				score = 0;
				restartScene = true;
				goAhead = true;
				//console.log("restartScene: ",restartScene);
				gameOver = false;
				//console.log("gameOver: ",gameOver);
				startedGame = false;
				//console.log("startedGame: ",startedGame);
				correctAnswer = true;
				//console.log("correctAnswer: ",correctAnswer);
				game.scene.resume("default");
			}
		
		}
		else if(!pausedGame && startedGame && jumpArea && player.body.touching.down) {
					jumpRatio = nextNote-currentNote+1;
					jumpKey = String(jumpRatio);
					if(event.key == nextNote && currentNote<=nextNote) { //Go up
						goAhead = true;
						correctAnswer = true;
						switch(jumpKey) {
							case "1":
								player.setVelocityY(-250*Math.pow(gameVelocity, 1/3)); //OK
								break;
							case "2":
								player.setVelocityY(-450*Math.pow(gameVelocity, 1/3)); //OK
								break; 
							case "3":
								player.setVelocityY(-600*Math.pow(gameVelocity, 1/6)); //OK
								break;
							case "4":
								player.setVelocityY(-750*Math.pow(gameVelocity, 1/15)); //OK
								break;
							case "5":
								player.setVelocityY(-830*Math.pow(gameVelocity, 1/17)); //OK
								break;
							case "6":
								player.setVelocityY(-950*Math.pow(gameVelocity, 1/18)); //OK
								break;
							case "7":
								player.setVelocityY(-1000*Math.pow(gameVelocity, 1/19)); //OK
								break;
							case "8":
								player.setVelocityY(-1090*Math.pow(gameVelocity, 1/20)); //OK
								break;
							default:
								break;
						}
					} else if (event.key == nextNote) { //Go down
								player.setVelocityY(-300); //OK
								correctAnswer = true;
								goAhead = true;
							}
							
//*************************************************************************************************************************
					/*
					Ti ho messo 2 approcci, scegli tu quale ti pare più comodo
					N.B: In questa sezione siamo dentro a un if in cui si entra solo se:
						- il gioco è partito
						- il gioco non è in pausa
						- il player sta toccando una piattaforma
						- il player è nell'area di salto
					*/
					
					noteKeys = "asdfghjk" //Tasti da usare
					
					//Questo è il metodo che avevamo usato per la tastierina
						/*
						noteFreq = []
						for(var i=0;i<12;i++){
							//Qui inizializzi il vettore delle frequenze da passare alla tua funzione playNote()
						}
						playNote(noteFreq(noteKeys.indexOf(event.key)))
						*/
					
					//Metodo con un semplice switch
						/*
						switch(event.key){
							case "a":
								playNote(frequenzaDO);
								break;
							case "s":
								playNote(frequenzaRE);
								break;
							case "d":
								playNote(frequenzaMI);
								break;
							case "f":
								playNote(frequenzaFA);
								break;
							case "g":
								playNote(frequenzaSOL);
								break;
							case "h":
								playNote(frequenzaLA);
								break;
							case "j":
								playNote(frequenzaSI);
								break;
							case "k":
								playNote(frequenzaDO+ottava);
								break;
							default:
								break;
						}
						*/

//*************************************************************************************************************************					
				}
	}
}

function jumpLevel(level) {
	console.log("Pitch detected level: ", level);
	
	if(player.body.touching.down && !pausedGame && jumpArea) {
		jumpRatio = nextNote-currentNote+1;
		jumpKey = String(jumpRatio);
		if(level == nextNote && currentNote<=nextNote) { //Go up
			goAhead = true;
			correctAnswer = true;
			switch(jumpKey) {
				case "1":
					player.setVelocityY(-250*Math.pow(gameVelocity, 1/3)); //OK
					break;
				case "2":
					player.setVelocityY(-450*Math.pow(gameVelocity, 1/3)); //OK
					break; 
				case "3":
					player.setVelocityY(-600*Math.pow(gameVelocity, 1/6)); //OK
					break;
				case "4":
					player.setVelocityY(-750*Math.pow(gameVelocity, 1/15)); //OK
					break;
				case "5":
					player.setVelocityY(-830*Math.pow(gameVelocity, 1/17)); //OK
					break;
				case "6":
					player.setVelocityY(-950*Math.pow(gameVelocity, 1/18)); //OK
					break;
				case "7":
					player.setVelocityY(-1000*Math.pow(gameVelocity, 1/19)); //OK
					break;
				case "8":
					player.setVelocityY(-1090*Math.pow(gameVelocity, 1/20)); //OK
					break;
				default:
					break;
			}
		} else if (level == nextNote) { //Go down
					player.setVelocityY(-300); //OK
					correctAnswer = true;
					goAhead = true;
				}
	}
	else if(level ==0 && player.body.touching.down && !pausedGame) {
					//goAhead = false;
				}
}