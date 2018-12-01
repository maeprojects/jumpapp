//Settings
var resolution = [window.innerWidth, window.innerHeight]
var gravity = 850;
var playerGravity = 400;
var gameVelocity = 1;
var numberOfLevels = 8;
var backgroundGridColor = 0x000000;
var platformColor = 0x000000;


//Game Configuration
var config = {
	type: Phaser.AUTO,
	width: resolution[0],
	height: resolution[1],
	backgroundColor: '#FFFFFF',
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
var levels;
var platformVelocity;
var platformTouched;
var platformWidth;
var platformHeight;
var platformInitialX;
var nextNote;
var currentNote;

//Graphic drawings object manager
var graphics;


function preload ()
{
	//Needed to be set here to set the player dimension correctly
	playerWidth = 32;
	playerHeight = 48;
	
	//Loading of game resources
	this.load.image('gameover', 'assets/gameover.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: playerWidth, frameHeight: playerHeight });
}

var graphicRect;

function createGraphicRect(context, key, width, height, color= platformColor) {
	graphics=context.add.graphics();
	graphics.fillStyle(color,1);
	graphics.fillRect(0,0,width-1,height);
	graphics.generateTexture(key,width,height);
	graphics.destroy();
}

function createBackground(context, color= backgroundGridColor) {
	graphics=context.add.graphics();
	
	graphics.fillStyle(color,1);
	
	stepHeight = levelsFieldHeight/8;
	
	blackSteps = [true,false,true,false,true,false,false,true]; //From the bottom to the top
	yPointer = playerHeight; //Starts from the top to draw
	for (i = 1; i <= blackSteps.length; i++) { 
		if(blackSteps[blackSteps.length-i]) {
			graphics.fillRect(0,yPointer,resolution[0],stepHeight);
		}
		graphics.strokeRect(0,yPointer,resolution[0],stepHeight);
		yPointer += stepHeight;
	}
	
	graphics.generateTexture('background',resolution[0],resolution[1]);
	
	graphics.destroy();
	
}


function create ()
{	
	initVariables();
	
	//Calculation of levels Field (Height of the scene in which levels can appear)
	levelsFieldHeight = resolution[1]-playerHeight*2;
	
	//Add Background
	createBackground(this);
	this.add.image(resolution[0]/2, resolution[1]/2, 'background').setAlpha(0.09);
	
	//Set world bounds
	this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);
	
	//Player Creation
	player = this.physics.add.sprite(playerFixedX, playerInitialY, 'dude');
	
	player.setCollideWorldBounds(false); //So the player can exceed the world boundaries
	player.body.setGravityY(-gravity); //For the player to have an y acceleration
	
	
	//Platforms group creation
	createGraphicRect(this, 'platform', platformWidth, platformHeight);
	platforms = this.physics.add.staticGroup();
	
	//First Platform creation
	
	//List of levels generation
	for (i = 1; i <= numberOfLevels; i++) { 
		levels[i-1] = i;
	}
	
	//Generation of the platforms visible when the game starts
	numberOfPlatforms = (resolution[0]-platformInitialX)/platformWidth;
	for(i=0; i<numberOfPlatforms; i++) {
		newRandomLevel = generateRandomLevel();
		levelValue = newRandomLevel[0];
		levelHeight = newRandomLevel[1];
		randomLevel = platforms.create((platformInitialX+platformWidth*i), levelHeight, 'platform');
		randomLevel.note = levelValue;
	}
	
	
	//Player Animations Creation
	this.anims.create({
		key: 'playerRun',
		frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 9 }),
		frameRate: 15*Math.sqrt(gameVelocity),
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'playerStop',
		frames: [ { key: 'dude', frame: 1 } ],
		frameRate: 5
	});
		
	
	//Creation of colliders btw player and game field
	this.physics.add.collider(player, platforms, platformsColliderCallback);
		
	
	//Adding score
	scoreText = this.add.text(16, 16, 'score:       Enter/Space to start', { fontSize: '32px', fill: '#000' });
	scoreText.setScrollFactor(0);
	
	sceneCreated = true;
	console.log("sceneCreated: ",sceneCreated);
}

function update ()
{
	if(startedGame){
		if(!pausedGame) {
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
				
				newRandomLevel = generateRandomLevel();
				levelValue = newRandomLevel[0];
				levelHeight = newRandomLevel[1];
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
				}
			}
			
			if(!goAhead) {
				this.physics.world.colliders.destroy();
			}
		} else {
			player.anims.play('playerStop', true);
		}
	}
	
	if(restartScene) {
		this.scene.restart();
		restartScene = false;
		console.log("restartScene: ",restartScene);
	}
}

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
	levels = [];
	platformVelocity = 0;
	platformWidth = 300;
	platformHeight = 30;
	platformInitialX = (playerFixedX-playerWidth/2)+platformWidth/2;
	nextNote = 0;
	currentNote = 0;
	
	//Pitch detector initialization
	const pitchDetector = new PitchDetector();
	pitchDetector.start();
}

var generateRandomLevel = function() {
	randomLevelValue = Math.floor(Math.random()*(levels.length))+1;
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

document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){
			
			if(!startedGame){
				if(sceneCreated) {
					player.body.setGravityY(playerGravity);
					scoreText.setText('score: ' + score);
					startedGame = true;
					//console.log("startedGame: ",startedGame);
					pitchDetector.toggleEnable();
				}
				
			} else if(!gameOver){
				pausedGame = !pausedGame;
				if(pausedGame) scoreText.setText('score: ' + score + ' Game Paused, Enter/Space to resume...');
				else scoreText.setText('score: ' + score);
				console.log("PausedGame: ",pausedGame);
				pitchDetector.toggleEnable();
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
					goAhead = false;
				}
}