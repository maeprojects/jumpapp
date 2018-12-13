//Settings
var resolution = [window.innerWidth, window.innerHeight]
var gravity = 850;
var playerGravity = 300;
var gameVelocity = 1;
var numberOfLevels = 8;
var backgroundGridColor = 0xffe8e8;
var backgroundColor = 0xFFFFFF;
var platformColor = 0x41423c;
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

//Game grid-rhythm settings
var timeSignature;
	
//Game status managing
var gameStatus;
var restartScene;

//Jump event managing
var goAhead;
var noAnswer;
var jumpArea;
var jumpAreaWidth;

//Player position
var playerFixedX;
var playerInitialY;
var playerPreviousY;

//Platforms (levels)
var levelsFieldHeight;
var stepHeight;
var platformVelocity;
var platformTouched;
var measurePlatformWidth;
var platformHeight;
var platformInitialX;
var nextLevel;
var currentLevel;
var currentPlatform;
var gameLevel;

//Collider
var collider;

//Graphic drawings object manager
var graphics;
	
//Pitch detector initialization (here to create only one object even if the game is restarted)
const pitchDetector = new PitchDetector();
pitchDetector.start();

function initVariables() {
	//Game Level
	gameLevel = 0;

	//Game score
	score = 0;

	//Game state managing
	gameStatus = "Initialized";
	restartScene = false;
	
	//Game grid-rhythm settings
	timeSignature = 4;

	//Jump event managing
	goAhead = true;
	noAnswer = false;
	jumpArea = false;
	jumpAreaWidth = playerWidth+40*gameVelocity;

	//Player position
	playerFixedX = 200;
	playerInitialY = playerHeight/2;
	playerPreviousY = 0;

	//Platforms (levels)
	levelsFieldHeight = resolution[1]-playerHeight*2; //Calculation of levels Field (Height of the scene in which levels can appear)
	stepHeight = levelsFieldHeight/numberOfLevels;

	platformTouched = false;
	platformVelocity = 0;
	measurePlatformWidth = 800;
	platformHeight = stepHeight-((stepHeight*40)/100);
	platformInitialX = (playerFixedX-playerWidth/2)+(measurePlatformWidth/2);
	nextLevel = 0;
	currentLevel = 0;

	//ScaleMapping inizialization
	//changeNoteReference("C3")
	changeScaleReference("ionian");
	
	//Pitch manager
	if(pitchDetector.isEnable())
		pitchDetector.toggleEnable();
}


//GAME SCENES MANAGER
/*
Current Game Scenes pipeline:

splashScene -> syncScene -> playScene --------   (--> settingsScene)
								^			 |
								|			 |
							gameoverScene <---
							
playScene: manage the starting state (with variable gameStatus) and the different levels (with the variable gameLevel)
*/

var splashScene = {
	create: function() {
		text = this.add.text(0,0, "Splash Screen: Work in progress...",  { font: "bold 32px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
		
		this.input.on('pointerdown', function() {
			game.scene.start("syncScene");
			game.scene.stop("splashScene");
		});
		
		this.input.keyboard.on('keydown', function() {
			game.scene.start("syncScene");
			game.scene.stop("splashScene");
		});
	}
}
game.scene.add("splashScene", splashScene);

var syncScene = {
	create: function() {
		text = this.add.text(0,100, "Sync Screen: Work in progress...",  { font: "bold 32px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
		
		this.input.on('pointerdown', function() {
			game.scene.start("playScene");
			game.scene.stop("syncScene");
		});
		
		this.input.keyboard.on('keydown', function() {
			game.scene.start("playScene");
			game.scene.stop("syncScene");
		});
	}
}
game.scene.add("syncScene", syncScene);

var playScene = {
	preload: function() {
		//Needed to be set here to set the player dimension correctly
		playerWidth = 19;
		playerHeight = 48;
		
		//Loading of game resources
		this.load.image('gameover', 'assets/gameover.png');
		this.load.spritesheet('player', 'assets/player.png', { frameWidth: playerWidth, frameHeight: playerHeight });
	},
	create: function() {
		
		initVariables();

		//WORLD
		
		//Add Background
		createBackground(this); //Draw the background texture
		backgroundImage = this.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
		backgroundImage.setDepth(-2);
		backgroundImage.setAlpha(0); //In order to create a fade-in animation for the background
		tween = this.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
		
		//Set world bounds
		this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);
		
		//PLAYER

		player = this.physics.add.sprite(playerFixedX, playerInitialY, 'player');
		player.setCollideWorldBounds(false); //So the player can exceed the world boundaries
		player.body.setGravityY(-gravity); //For the player to have an y acceleration; set to (-gravity) to make the player have no y motion at first
		//player.setTint(0x000000); //Set a color mask for the player

		//Player Animations Creation
		this.anims.create({
			key: 'playerRun',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
			frameRate: 15*Math.sqrt(gameVelocity), //To set the veloticy of "rotation" dependent to the gameVelocity
			repeat: -1 //loop=true
		});

		this.anims.create({
			key: 'playerStop',
			frames: [ { key: 'player', frame: 0 } ],
			frameRate: 2
		});
		
		//PLATFORMS GENERATION
		
		//nextNoteDuration = getDurationNote();
		createPlatformTexture(this, measurePlatformWidth/2, platformHeight); //Draw the platform texture
		
		platforms = this.physics.add.staticGroup(); //Platforms empty group creation
		
		//Generation of the platforms visible when the game starts
		//numberOfInitialPlatforms = resolution[0]/(measurePlatformWidth/2); //Exceed the number of effectively shown platforms to avoid horizontal white spaces between platforms
		
		pointer = 0;
		i = 0;
		while(pointer < resolution[0]) {
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			levelDuration = newLevel[2];
			createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
			if(i==0)
				platformInitialX = (playerFixedX-playerWidth/2)+((measurePlatformWidth*levelDuration)/2);
			lastCreatedPlatform = platforms.create(pointer+platformInitialX, levelHeight, 'platform'+levelDuration);
			lastCreatedPlatform.level = levelValue;
			
			pointer += measurePlatformWidth*levelDuration;
			currentPlatform = lastCreatedPlatform;
			
			
			//Set of current and next level when the game starts
			switch(i){
				case 0:
					currentLevel = levelValue;
					break;
				case 1:
					nextLevel = levelValue;
					break;
			}
			i++;
		}
		
		
		//GRID GENERATION
		
		createGridTexture(this, measurePlatformWidth, timeSignature); //Draw grid texture
		measureGrids = this.physics.add.staticGroup(); //Grids empty group creation
		
		gridLength = measurePlatformWidth;
		numberOfInitialMeasures = resolution[0]/measurePlatformWidth;
		for(i=0; i<numberOfInitialMeasures; i++) {
			lastGrid = measureGrids.create((playerFixedX-(playerWidth/2)+(gridLength/2))+(gridLength*i)-5, resolution[1]/2, 'grid-texture');
			lastGrid.setDepth(-1);
		}
		
		
		//Creation of collider between the player and the platforms, with a callback function
		collider = this.physics.add.collider(player, platforms, platformsColliderCallback);
			
		
		//SCORE
		scoreText = this.add.text(16, 16, 'score:       Enter/Space to start', { fontSize: fontSize, fill: fontColor });
		
		//SETTING OF GAME STATUS
		gameStatus = "Started";
	},
	
	update: function() {
		//GRID MANAGER
		
		measureGrids.getChildren().forEach(function(p){
			if(p.x < -p.width/2)
				p.destroy(); //Remove grids that are no more visible
		})
		
		measureGrids.getChildren().forEach(function(p){
			//Move grids (body and texture)
			p.x = p.x - platformVelocity;
			p.body.x = p.body.x - platformVelocity;
		});
		
		//Creation of new grid measures
		if(lastGrid.x < resolution[0]-lastGrid.width/2){ //When the platform is completely on the screen, generate a new platform
			lastGrid = measureGrids.create(resolution[0]+lastGrid.width/2, resolution[1]/2, 'grid-texture');
			lastGrid.setDepth(-1);
		}
		
		
		// PLATFORMS MANAGER: MOVEMENT, REMOVAL, CONDITIONS
		
		playerLeftBorder = (playerFixedX-player.width/2);
		
		platforms.getChildren().forEach(function(p){
			if(p.x < -p.width/2)
				p.destroy(); //Remove platforms that are no more visible
		})
		
		platforms.getChildren().forEach(function(p){
			
			//PLATFORM MOVEMENT-REMOVAL MANAGEMENT
			
			//Move platforms (body and texture)
			p.x = p.x - platformVelocity;
			p.body.x = p.body.x - platformVelocity;
			
			//PLATFORMS CONDITIONAL EVENTS
			platformLeftBorder = (p.x-(p.width/2));
			currentPlatformWidth = p.width;
			
			//Set jumpArea when the player enter the jumpArea
			playerEnterJumpArea = (playerLeftBorder >= platformLeftBorder+currentPlatformWidth-jumpAreaWidth) && ((playerLeftBorder-gameVelocity) <= (platformLeftBorder+currentPlatformWidth-jumpAreaWidth));
			if(playerEnterJumpArea) {
				jumpArea = true;
				noAnswer = true; //Answer again ungiven
			}
			
			/*These two mutually exclusive conditions are needed because during a single execution of forEach() function, these 2 conditions
			are true on subsequent elements. (i.e. if the first condition is true on the 3rd element, the second condition is true on the 
			following 4th element */			
			currentPlatformChanged =  (playerLeftBorder >= platformLeftBorder) &&  (playerLeftBorder-gameVelocity <= platformLeftBorder); //Condition to summarize when the player enter on another platform
			nextPlatformChanged =  (playerLeftBorder+currentPlatformWidth >= platformLeftBorder)  && ((playerLeftBorder-gameVelocity)+currentPlatformWidth <= platformLeftBorder); //Condition to summarize when the platform following the one in which the player enter is changed
			
			//If the next Platform is changed a new nextLevel is set
			if(nextPlatformChanged) {
				nextLevel = p.level;
			}
			
			//Current Platform Changed Event: if no events are triggered before the platform changes, the player was wrong and it has to die, otherwise it jumps to another platform
			if(currentPlatformChanged) {
				currentLevel = p.level; //A new currentLevel is set
				currentPlatform = p;
				
				
				
				if(noAnswer) //Answer ungiven: the player should die
					goAhead = false;
				
				jumpArea = false;//Not anymore in the jump area
			}
		})
		
		//Creation of new platforms
		if(lastCreatedPlatform.x < resolution[0]-lastCreatedPlatform.width/2){ //When the platform is completely on the screen, generate a new platform
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			levelDuration = newLevel[2];
			createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
			lastCreatedPlatform = platforms.create(resolution[0]+(measurePlatformWidth*levelDuration)/2, levelHeight, 'platform'+levelDuration);
			lastCreatedPlatform.level = levelValue;
			
			
			//New background on level change
			if(gameLevel<gameLevelToScaleArray.length-1) {
				tween = this.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 500, alpha: { getStart: () => 1, getEnd: () => 0 } });
				tween.setCallback("onComplete", function(){
					backgroundImage.destroy();
					backgroundImage = newbackgroundImage;
				}, backgroundImage);
				
				gameLevel++;
				createBackground(this);
				changeGameLevel(gameLevel);
				newbackgroundImage = this.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
				newbackgroundImage.setAlpha(0);
				newbackgroundImage.setDepth(-2);
				newtween = this.add.tween({ targets: newbackgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });
			}
		}
		
		//PLAYER ANIMATION MANAGER
		
		if(player.body.touching.down) {
			player.anims.play('playerRun', true);
			gameStatus = "Running"; //The first time change the game status from Started to Running
		}	
		else {
			player.anims.play('playerStop', true);
			platformTouched = false;
		}
		
		//Make it possible to pass through the platform if the player comes from below
		if(!player.body.touching.down){ 
			if(player.y > playerPreviousY && collider.overlapOnly==true) {
				collider.overlapOnly = false;
				console.log("overlapOnly: ",collider.overlapOnly);
			}
			playerPreviousY = player.y;
		} 
		
		//GAME VELOCITY MANAGER
		if(gameStatus == "Running")
			platformVelocity = gameVelocity; //Keeps the platforms velocity updated since when the game is Running
		
		
		//GAME OVER HANDLER
		if(player.y > resolution[1]+player.height/2) { //When the player is below the screen resolution (no more visible), go to gameoverScene
			game.scene.start("gameoverScene");
		}
		
		
		//GO TO DEATH MANAGER		
		if(!goAhead) { //If the player can't go ahead, the colliders with the world are destroyed
			this.physics.world.colliders.destroy();
		}
	}
}
game.scene.add("playScene", playScene);

var gameoverScene = {
	create: function() {
		game.scene.pause("playScene");
		this.add.image(resolution[0]/2, resolution[1]/2, 'gameover'); //Show game over image
		player.destroy(); //Destroy the player
		scoreText.setText('score: ' + score + '    Enter/Space to restart'); //Update the status text
		if(pitchDetector.isEnable()) 
			pitchDetector.toggleEnable(); //If the pitch detector is enabled, disable it
				
		this.input.keyboard.on('keydown', function() {
			game.scene.start("playScene"); 
			game.scene.stop("gameoverScene");
		});
	}
}
game.scene.add("gameoverScene", gameoverScene);

var settingsScene = {
	create: function() {
		console.log("Settings Screen: Work in progress...");
	}
}
game.scene.add("settingsScene", settingsScene);


game.scene.start("playScene");



function createPlatformTexture(context, width, height, levelDuration, color= platformColor) {
	graphics=context.add.graphics();
	graphics.fillStyle(color,1);
	graphics.fillRect(0,0,width-1,height); //width-1 to see the division between two platforms at the same level
	graphics.generateTexture('platform'+levelDuration, width, height);
	graphics.destroy();
}

function createGridTexture(context, measurePlatformWidth, timeSignature) {
	graphics=context.add.graphics();
	
	xPointer = 0;
	for(i=0; i<timeSignature; i++) {
		graphics.beginPath();
		switch(i) {
			case 0:
				graphics.lineStyle(20, 0xFF0000, 1);
				break;
			case 1:
			case 3:
				graphics.lineStyle(1, 0xFF0000, 1);			 
				break;
			case 2:
				graphics.lineStyle(5, 0xFF0000, 1);
				break;
		}
		graphics.moveTo(xPointer, 0);
		graphics.lineTo(xPointer, resolution[1]);
		xPointer+=(measurePlatformWidth/timeSignature);
		graphics.closePath();
		graphics.strokePath();
	}
	
	graphics.generateTexture('grid-texture',measurePlatformWidth,resolution[1]-playerHeight*2);
	graphics.destroy();
}


function createBackground(context, color= backgroundGridColor) {
	graphics=context.add.graphics();
	
	//From the bottom (position 0) to the top (position 7) of the screen
	yPointer = playerHeight; //Starts from the top to draw
	colorsArray = scaleToColorsArray[gameLevelToScaleArray[gameLevel]]
	for (i = 1; i <= colorsArray.length; i++) {
		graphics.fillStyle(colorsArray[scaleToColorsArray[gameLevelToScaleArray[0]].length-i],1);
		graphics.lineStyle(0.1, "0x000000", 1);
		graphics.fillRect(0,yPointer,resolution[0],stepHeight);
			
		graphics.strokeRect(0,yPointer,resolution[0],stepHeight); //Rectangle border
		yPointer += stepHeight;
	}
	
	graphics.generateTexture('background'+gameLevel,resolution[0],resolution[1]);
	
	graphics.destroy();
}

var generateLevel = function() {
	durationAndNote = getDurationAndNote();
	
	if(durationAndNote[0]!=null) {
		levelDuration = durationAndNote[0]; //level Duration i.e.:1, 1/2, 1/4, 1/8, ...
	}
	else {
		console.log("WARNINGGGGGGGG!!!! YOUR DEVICE WILL EXPLODE!!!!");
		levelDuration = 1;
	}
		
	if(durationAndNote[1]!=null)
		levelValue = durationAndNote[1];
	else
		levelValue = Math.floor(Math.random()*(numberOfLevels))+1;
	
	levelHeight = (player.height)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
	return [levelValue, levelHeight, levelDuration];
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down) {
		score++;
		scoreText.setText('score: ' + score);
		player.setVelocityX(0);
	}
	platformTouched = true; //Needed to take only the first collision with the platform
}

document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){
			
			switch(gameStatus) {
				
				case "Started": //The game should start running
					player.body.setGravityY(playerGravity);
					scoreText.setText('score: ' + score);
					
					//Starting Pitch Detector (the condition is not mandatory)
					if(!pitchDetector.isEnable())
						pitchDetector.toggleEnable();
					
					//Starting scene (update() function starts looping)
					game.scene.resume("playScene");
					break;
				
				case "Running": //The game should toggle the pause status
					if(game.scene.isActive("playScene")) {
						game.scene.pause("playScene");
						scoreText.setText('score: ' + score + ' Game Paused, Enter/Space to resume...');
					}
					else {
						game.scene.resume("playScene");
						scoreText.setText('score: ' + score);
					}
					
					pitchDetector.toggleEnable(); //Toggling of active status of the pitch detector (assuming that at first it's already enabled)
					break;
					
				default:
					break;
			}
		
		}
		else if(gameStatus=="Running" && player.body.touching.down && jumpArea) {
					
					//Play a note directly into the pitchDetector module for the pitch detecting step (Debug code)
					noteKeys = "12345678" //Tasti da usare
					noteFreqKeys = [];
					for(i=0; i<currentScale.length; i++) {
						noteFreqKeys[i] = noteFreq[currentScale[i]];
					}
					console.log(currentScale[noteKeys.indexOf(event.key)])
					pitchDetector.tuner.play(noteFreqKeys[noteKeys.indexOf(event.key)]);
				}

	}
}

function jumpAtLevel(level) {
	
	if(gameStatus=="Running" && player.body.touching.down && jumpArea) {
		jumpRatio = String(nextLevel-currentLevel+1);
		
		//If the note detected is correct:
		if(level == nextLevel && currentLevel<=nextLevel) { //Go up
			player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity)*stepHeight*jumpRatio,1/2));
			collider.overlapOnly = true;
			console.log("overlapOnly: ",collider.overlapOnly);
			goAhead = true; //The answer is correct
			noAnswer = false; //An answer has been given
		} else if (level == nextLevel) { //Go down
					player.setVelocityY(-450/Math.pow(gameVelocity, 1/2));
					goAhead = true;
					noAnswer = false;
				}
				//Else go ahead remain false and the player fall down
				
	}
	else if(level == 0 && player.body.touching.down && gameStatus=="Running") {
					//goAhead = false; //The player fall down if a wrong note is singed (even out of the jump area)
				}
}