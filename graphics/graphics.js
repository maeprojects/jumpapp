//Settings
var resolution = [window.innerWidth, window.innerHeight]
var gravity = 850;
var gameVelocity = 1;
var playerGravity = 2000*gameVelocity;
var numberOfLevels = 8;
var backgroundGridColor = 0xffe8e8;
var backgroundColor = 0xFFFFFF;
var platformColor = 0x41423c;
var gridColor = "186, 181, 180, "
var gridOpacity = 0.4;
var fontSize = '20px';
var fontColor = '#F00';
var pointsToChangeLevel = 3;



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
var changeLevelEvent;
var changeLevelStatusDuration;
var scoreToChangeLevel;

//Jump event managing
var goAhead;
var noAnswer;
var jumpArea;
var jumpAreaWidth;

//Player position
var gameInitialX;
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
var platformInitialPlayerOffset;
var spaceBetweenPlatforms;
var levelsQueue;
var currentPlatform;
var playerPauseY;
var gameLevel;

//PAUSE
var playerPauseMotion;
var jumpFromPause;

//Intro
var initialScaleNote;

//Collider
var collider;

//Graphic drawings object manager
var graphics;

//Pitch detector initialization (here to create only one object even if the game is restarted)
const pitchDetector = new PitchDetector();
pitchDetector.start();

//Game context
var gameContext;

function initVariables() {
	//Game Level
	gameLevel = 0;

	//Game score
	score = 0;

	//Game Intro
	initialScaleNote = 1;

	//Game state managing
	gameStatus = "Initialized";
	restartScene = false;
	changeLevelEvent = false; //Manage the period in which there's a change of level
	changeLevelStatusDuration = 1/2;
	scoreToChangeLevel = 0;

	//Game grid-rhythm settings
	timeSignature = 4;

	//Jump event managing
	goAhead = true;
	noAnswer = false;
	jumpArea = false;
	jumpAreaWidth = playerWidth+20*gameVelocity;

	//Player position
	playerFixedX = 100;
	playerInitialY = resolution[1] - playerHeight/2;
	playerPreviousY = 0;

	//Platforms (levels)
	levelsFieldHeight = resolution[1]-playerHeight*2; //Calculation of levels Field (Height of the scene in which levels can appear)
	stepHeight = levelsFieldHeight/numberOfLevels;

	platformTouched = false;
	platformVelocity = 0;
	measurePlatformWidth = 800;
	gameInitialX = 200;
	platformHeight = stepHeight-((stepHeight*40)/100);
	platformInitialX = (gameInitialX-playerWidth/2)+(measurePlatformWidth/2);
	platformInitialPlayerOffset = 6;
	spaceBetweenPlatforms = 2;
	levelsQueue = [];

	//Pause
	playerPauseMotion = false;
	var jumpFromPause = false;

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
		this.load.spritesheet('player-fly', 'assets/player_fly_nice.png', { frameWidth: 28, frameHeight: playerHeight });
	},
	create: function() {

		initVariables();
		gameContext = this;

		//WORLD
		//------------------------------------------------------------------------------------------------------
		//Add Background
		createBackground(this); //Draw the background texture
		backgroundImage = this.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
		backgroundImage.setDepth(-2);
		backgroundImage.setAlpha(0); //In order to create a fade-in animation for the background
		tween = this.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });

		//Set world bounds
		this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);

		//PLAYER
		//------------------------------------------------------------------------------------------------------
		player = this.physics.add.sprite(playerFixedX, playerInitialY, 'player-fly');
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

		this.anims.create({
			key: 'playerFly',
			frames: this.anims.generateFrameNumbers('player-fly', { start: 0, end: 8 }),
			frameRate: 15*Math.sqrt(gameVelocity), //To set the veloticy of "rotation" dependent to the gameVelocity
			repeat: -1 //loop=true
		});

		//PLATFORMS GENERATION
		//------------------------------------------------------------------------------------------------------
		platforms = this.physics.add.staticGroup(); //Platforms empty group creation

		//Generation of the platforms visible when the game starts

		pointer = 0;
		j = 0;
		while(pointer < resolution[0]) {
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			levelDuration = newLevel[2];
			createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
			if(j==0) {
				platformInitialX = (gameInitialX-playerWidth/2)+((measurePlatformWidth*levelDuration)/2)-platformInitialPlayerOffset;
				pointer = platformInitialX;
			}
			else {
				pointer += (measurePlatformWidth*levelDuration)/2;
			}

			lastCreatedPlatform = platforms.create(pointer, levelHeight, 'platform'+levelDuration+platformHeight);
			lastCreatedPlatform.level = levelValue;
			lastCreatedPlatform.duration = levelDuration;
			lastCreatedPlatform.changeLevel = false;
			if(levelValue == 0) {
				lastCreatedPlatform.setVisible(false); //Hide texture
				lastCreatedPlatform.disableBody(); //Disable the body
			}

			levelsQueue.push(levelValue);
			//console.log("levelsQueue: ",levelsQueue);

			pointer += (measurePlatformWidth*levelDuration)/2;

			//Set the first platform as current platform when the game starts
			if(j ==0)
				currentPlatform = lastCreatedPlatform;

			j++;

		}

		//INITIAL SCALE, HIDDEN PLATFORMS GENERATION
		for(note=1; note<=8; note++) {
			levelValue = note;
			levelHeight = (player.height)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
			levelDuration = 1/8;

			createPlatformTexture(this, measurePlatformWidth*levelDuration, 5, levelDuration);

			scalePlatform = platforms.create(playerFixedX, levelHeight, 'platform'+levelDuration+5);
			scalePlatform.setVisible(false); //Hide texture
		}


		//GRID GENERATION
		//------------------------------------------------------------------------------------------------------
		createGridTexture(this, measurePlatformWidth, timeSignature); //Draw grid texture
		measureGrids = this.physics.add.staticGroup(); //Grids empty group creation

		gridLength = measurePlatformWidth;
		numberOfInitialMeasures = resolution[0]/measurePlatformWidth;
		for(i=0; i<numberOfInitialMeasures; i++) {
			lastGrid = measureGrids.create((gameInitialX-(playerWidth/2)+(gridLength/2))+(gridLength*i)-platformInitialPlayerOffset, resolution[1]/2, 'grid-texture');
			lastGrid.setDepth(-1);
			lastGrid.progressiveNumber = 0; //zero identifies all the grids created when the game is started
		}


		//Creation of collider between the player and the platforms, with a callback function
		collider = this.physics.add.collider(player, platforms, platformsColliderCallback);


		//SCORE
		//------------------------------------------------------------------------------------------------------
		scoreText = this.add.text(16, 16, 'score:       Enter/Space to start', { fontSize: fontSize, fill: fontColor });

		//SETTING OF GAME STATUS
		//------------------------------------------------------------------------------------------------------
		gameStatus = "Started";
	},

	update: function() {
		//GRID MANAGER
		//------------------------------------------------------------------------------------------------------
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
		if(lastGrid.x <= resolution[0]-measurePlatformWidth/2){ //When the platform is completely on the screen, generate a new platform
			prevGridNumber = lastGrid.progressiveNumber;

			if(lastGrid.progressiveNumber == 0) { //The first to be created with update function
				lastGrid = measureGrids.create(resolution[0]+(measurePlatformWidth/2)-1, resolution[1]/2, 'grid-texture');
				lastGrid.setDepth(-1);
			}
			else {
				lastGrid = measureGrids.create(resolution[0]+(measurePlatformWidth/2), resolution[1]/2, 'grid-texture');
				lastGrid.setDepth(-1);
			}
			lastGrid.progressiveNumber = prevGridNumber+1;
		}


		// PLATFORMS MANAGER: MOVEMENT, REMOVAL, CONDITIONS
		//------------------------------------------------------------------------------------------------------
		//Creation of new platforms
		if(lastCreatedPlatform.x <= resolution[0]-lastCreatedPlatform.width/2){ //When the platform is completely on the screen, generate a new platform
			newLevel = generateLevel();
			levelValue = newLevel[0];
			levelHeight = newLevel[1];
			levelDuration = newLevel[2];
			createPlatformTexture(this, measurePlatformWidth*levelDuration, platformHeight, levelDuration);
			lastCreatedPlatform = platforms.create(resolution[0]+(measurePlatformWidth*levelDuration)/2, levelHeight, 'platform'+levelDuration+platformHeight);
			lastCreatedPlatform.level = levelValue;
			lastCreatedPlatform.duration = levelDuration;
			lastCreatedPlatform.changeLevel = false;
			if(changeLevelEvent) {
				lastCreatedPlatform.changeLevel = true;
				changeLevelEvent = false;
			}

			if(levelValue == 0) {
				lastCreatedPlatform.setVisible(false); //Hide texture
				lastCreatedPlatform.disableBody(); //Disable the body
			}

			levelsQueue.push(levelValue);
			//console.log("levelsQueue: ",levelsQueue);
		}

		playerLeftBorder = (gameInitialX-player.width/2);

		platforms.getChildren().forEach(function(p){
			if(p.x < -p.width/2)
				p.destroy(); //Remove platforms that are no more visible
		})

		platforms.getChildren().forEach(function(p){

			//PLATFORM MOVEMENT-REMOVAL MANAGEMENT
			//------------------------------------------------------------------------------------------------------
			//Move platforms (body and texture)
			p.x = p.x - platformVelocity;
			p.body.x = p.body.x - platformVelocity;

			//PLATFORMS CONDITIONAL EVENTS
			//------------------------------------------------------------------------------------------------------
			platformLeftBorder = (p.x-(p.width/2));
			currentPlatformWidth = currentPlatform.width;

			//Set jumpArea when the player enter the jumpArea
			playerEnterJumpArea = (playerLeftBorder > platformLeftBorder+currentPlatformWidth-jumpAreaWidth) && ((playerLeftBorder-gameVelocity) <= (platformLeftBorder+currentPlatformWidth-jumpAreaWidth));
			if(playerEnterJumpArea) {
				jumpArea = true;
				noAnswer = true; //Answer again ungiven
				//console.log("Entered jump area");
			}

			currentPlatformChanged =  (playerLeftBorder > platformLeftBorder) &&  (playerLeftBorder-gameVelocity <= platformLeftBorder); //Condition to summarize when the player enter on another platform

			//Current Platform Changed Event: if no events are triggered before the platform changes, the player was wrong and it has to die, otherwise it jumps to another platform
			if(currentPlatformChanged) {

				if(levelsQueue[1] == 0)  {
					playerPauseY = player.y;
				}

				levelsQueue.shift(); //Remove the first element of the list
				//console.log('remove item!: ', levelsQueue);

				currentPlatform = p;

				if(noAnswer) //Answer ungiven: the player should die
					goAhead = false;

				jumpArea = false;//Not anymore in the jump area

			}
		})


		//PLAYER ANIMATION MANAGER
		//------------------------------------------------------------------------------------------------------
		if(player.body.touching.down && playerFixedX == 200) {
			player.anims.play('playerRun', true);
			gameStatus = "Running"; //The first time change the game status from Started to Running
			//Starting Pitch Detector (the condition is not mandatory)
			if(!pitchDetector.isEnable())
				pitchDetector.toggleEnable();

			//Reset Pause variables when the player touch a platform
			jumpFromPause = false;
			playerPauseMotion = false;
		}
		else {
			if(levelsQueue[0] != 0 || jumpFromPause) {
				player.anims.play('playerStop', true);
			}
			platformTouched = false;
		}

		//Make it possible to pass through the platform if the player comes from below
		if(!player.body.touching.down){
			if(player.y > playerPreviousY+1 && collider.overlapOnly==true) {
				collider.overlapOnly = false;
			}
			playerPreviousY = player.y;
		}

		// PAUSE MANAGER
		//------------------------------------------------------------------------------------------------------
		if(levelsQueue[0] == 0 && !jumpFromPause) {
			player.body.setGravityY(-gravity); //In order to make the player FLOW
			goAhead = true; //The player can keep going even if there was no answer (pause: you stay silent)

			//This condition is entered only once when the pause starts
			if(!playerPauseMotion) {
				playerEndY = ((player.height)+((numberOfLevels-levelsQueue[1])*stepHeight)+(stepHeight/2))-5; //Save the player y position (need to create the animation)

				//Player translation animation
				pauseTween = gameContext.add.tween({ targets: player, ease: 'Sine.easeInOut', duration: (currentPlatform.duration*10000), delay: 0, y: { getStart: () => playerPauseY, getEnd: () =>  playerEndY} });
				pauseTween.setCallback("onComplete", function(){
					player.y = playerEndY;
				}, player);

				playerPauseMotion = true; //condition should not enter anymore

				//Detect of "change level" type of pause and call of change level and background
				if(currentPlatform.changeLevel)
					changeLevelAndBackground();
			}

			//Condition needed because the playerWidth with the wings is greater than the normal player
			if(player.x-playerWidth/2-5>currentPlatform.x-currentPlatform.width/2) {
					player.anims.play('playerFly', true);
			}
		}

		//INITIAL SCALE ANIMATION MANAGER
		//------------------------------------------------------------------------------------------------------
		if(gameStatus == "Intro") {
			if(player.body.touching.down && initialScaleNote<8){
				playLevel(initialScaleNote);
				player.setVelocityY(-380);
				collider.overlapOnly = true;
				initialScaleNote++;
			}
			else if(player.body.touching.down){ //If you are at the last step, the game should start
				playLevel(initialScaleNote);
				player.setVelocityY(-400);
				t = gameContext.add.tween({ targets: player, ease: 'Sine.easeInOut', duration: 1000, delay: 0, x: { getStart: () => playerFixedX, getEnd: () =>  gameInitialX} });
				t.setCallback("onComplete", function(){
					playerFixedX = gameInitialX;
					player.setGravityY(playerGravity);
				}, player);
			}
		}

		//GAME VELOCITY MANAGER
		//------------------------------------------------------------------------------------------------------
		if(gameStatus == "Running")
			platformVelocity = gameVelocity; //Keeps the platforms velocity updated since when the game is Running


		//GAME OVER HANDLER
		//------------------------------------------------------------------------------------------------------
		if(player.y > resolution[1]+player.height/2) { //When the player is below the screen resolution (no more visible), go to gameoverScene
			game.scene.pause("playScene");
			game.scene.start("gameoverScene");
		}

		//GO TO DEATH MANAGER
		//------------------------------------------------------------------------------------------------------
		if(!goAhead) { //If the player can't go ahead, the colliders with the world are destroyed
			if(gameStatus == "Running"){
				player.body.setGravityY(playerGravity); //Needed to fall when in a pause step
				player.angle += 5; //Death Animation
			}
			this.physics.world.colliders.destroy();
		}
	}
}
game.scene.add("playScene", playScene);

var gameoverScene = {
	create: function() {
		gameStatus="Gameover"; //in order to avoid checks made when the gamestatus is running
		this.add.image(resolution[0]/2, resolution[1]/2, 'gameover'); //Show game over image
		player.destroy(); //Destroy the player
		scoreText.setText('score: ' + score + '    Enter/Space to restart'); //Update the status text
		playNote(convertLevelToNote(levelsQueue[0]), 1)
		if(pitchDetector.isEnable())
			pitchDetector.toggleEnable(); //If the pitch detector is enabled, disable it

		this.input.keyboard.on('keydown', function(e) {
			if(e.code == "Space" || e.code == "Enter") {
				game.anims.anims.clear() //Remove player animations before restarting the game
				game.textures.remove("grid-texture"); //Remove canvas texture before restarting the game
				game.scene.start("playScene");
				game.scene.stop("gameoverScene");
			}
		});
	}
}
game.scene.add("gameoverScene", gameoverScene);

var settingsScene = {
	create: function() {
		//console.log("Settings Screen: Work in progress...");
	}
}
game.scene.add("settingsScene", settingsScene);


game.scene.start("playScene");



function createPlatformTexture(context, width, height, levelDuration, color= platformColor) {
	graphics=context.add.graphics();
	graphics.fillStyle(color,1);
	graphics.fillRect(0,0,width-spaceBetweenPlatforms,height); //width-1 to see the division between two platforms at the same level
	graphics.generateTexture('platform'+levelDuration+height, width, height);
	graphics.destroy();
}

function createGridTexture(context, measurePlatformWidth, timeSignature) {

	var texture = 0;
	if(texture == 0)
		texture = context.textures.createCanvas('grid-texture', measurePlatformWidth, resolution[1]-playerHeight*2);
    textureContext = texture.getContext();

	xPointer = 0;
	for(i=0; i<=timeSignature; i++) {
		switch(i) {
			case 0:
				grd = textureContext.createLinearGradient(xPointer, 0, xPointer+5, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer, 0, xPointer+5, window.innerHeight);
				break;
			case 1:
			case 3:
				grd = textureContext.createLinearGradient(xPointer-2-spaceBetweenPlatforms/2, 0, xPointer+2, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(0.5, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-2-spaceBetweenPlatforms/2, 0, xPointer+2, window.innerHeight);
				break;
			case 2:
				grd = textureContext.createLinearGradient(xPointer-1-spaceBetweenPlatforms/2, 0, xPointer+1, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(0.5, "rgba("+gridColor+"0.8)");
				grd.addColorStop(1, "rgba("+gridColor+"0)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-2-spaceBetweenPlatforms/2, 0, xPointer+2, window.innerHeight);
				break;
			case 4:
				grd = textureContext.createLinearGradient(xPointer-5, 0, xPointer, 0);

				grd.addColorStop(0, "rgba("+gridColor+"0)");
				grd.addColorStop(1, "rgba("+gridColor+"0.8)");

				textureContext.fillStyle = grd;
				textureContext.fillRect(xPointer-5, 0, xPointer, window.innerHeight);
				break;
		}
		xPointer+=(measurePlatformWidth/timeSignature);
	}
	texture.refresh();
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
		console.log("WARNING!!!! YOUR DEVICE WILL EXPLODE!!!!");
		levelDuration = 1;
	}

	if(durationAndNote[1]!=null)
		levelValue = durationAndNote[1];
	else if(levelsQueue.length == 0) { //If it's the first level of the game, avoid generation of a pause
			levelValue = Math.floor(Math.random()*(numberOfLevels))+1; //Generate levels without pause
		}
		else {
			//Avoid creation of two successive pauses
			if(levelsQueue[levelsQueue.length-1] == 0){
				levelValue = Math.floor(Math.random()*(numberOfLevels))+1; //Generate levels without pause
			}
			else
				levelValue = Math.floor(Math.random()*(numberOfLevels+1)); //Generate levels with pause
		}

	if(changeLevelEvent) {
		levelValue = 0;
		levelDuration = changeLevelStatusDuration;
	}

	levelHeight = (player.height)+((numberOfLevels-levelValue)*stepHeight)+(stepHeight/2);
	return [levelValue, levelHeight, levelDuration];
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down) {
		score++;
		scoreText.setText('score: ' + score);

		//Change game level each 3 points
		scoreToChangeLevel++;
		if(scoreToChangeLevel == pointsToChangeLevel) {
			changeLevelEvent = true;
			//console.log("Change Level Event!");
		}

	}
	platformTouched = true; //Needed to take only the first collision with the platform
}

function changeLevelAndBackground() {
	scoreToChangeLevel = 0; //Reset point to reach in order to change level

	//New background on level change
	if(gameLevel<gameLevelToScaleArray.length-1) {
		gameLevel++; //Change Level

		//Remove Old Background
		tween = gameContext.add.tween({ targets: backgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 500, alpha: { getStart: () => 1, getEnd: () => 0 } });
		tween.setCallback("onComplete", function(){
			backgroundImage.destroy();
			backgroundImage = newbackgroundImage;
		}, backgroundImage);



		//Add new background
		createBackground(gameContext);
		changeGameLevel(gameLevel);
		newbackgroundImage = gameContext.add.image(resolution[0]/2, resolution[1]/2, 'background'+gameLevel);
		newbackgroundImage.setAlpha(0);
		newbackgroundImage.setDepth(-2);
		newtween = gameContext.add.tween({ targets: newbackgroundImage, ease: 'Sine.easeInOut', duration: 1000, delay: 0, alpha: { getStart: () => 0, getEnd: () => 1 } });


		//play next scale
		playScale(gameLevelToScaleArray[gameLevel], noteReference, 0.5)
	}
}


document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){

			switch(gameStatus) {

				case "Started": //The game should start running
					pitchDetector.resumeAudioContext()	//to enable the AudioContext of PitchDetector
					game.scene.resume("playScene"); //Starting scene (update() function starts looping)

					gameStatus = "Intro";
					player.body.setGravityY(playerGravity/100);
					player.setVelocityY(-400);
					collider.overlapOnly = true;
					break;

				case "Intro":
					scoreText.setText('score: ' + score);

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
		else if(gameStatus=="Running" && ( player.body.touching.down || (levelsQueue[0] == 0) ) && jumpArea) {

					//Play a note directly into the pitchDetector module for the pitch detecting step (Debug code)
					noteKeys = "12345678" //Keys To use
					noteFreqKeys = [];
					for(i=0; i<currentScale.length; i++) {
						noteFreqKeys[i] = noteFreq[currentScale[i]];
					}
					//console.log("keys")
					if(parseInt(event.key)>=1 && parseInt(event.key)<=8) {
						//console.log("Note played: ", currentScale[noteKeys.indexOf(event.key)])
						pitchDetector.tuner.play(noteFreqKeys[noteKeys.indexOf(event.key)]);
					}
				}

	}
}

function jumpAtLevel(level) {
	//console.log("called jumpAtLevel", level)
	if(gameStatus=="Running" && ( player.body.touching.down || (levelsQueue[0] == 0) ) && jumpArea) {
		if(levelsQueue[0] == 0) {
			jumpRatio = 1.5;

			if(level == levelsQueue[1]) //If the answer is correct
				jumpFromPause = true; //Need to remove the "fly" texture of the player when it jumps out of the pause
		} else
			jumpRatio = String(levelsQueue[1]-levelsQueue[0]+1);

		//If the note detected is correct:
		if(level == levelsQueue[1] && parseInt(jumpRatio) > 0) { //Go up
			//console.log("jump Up!", level);
			player.body.setGravityY(playerGravity);
			player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity)*stepHeight*jumpRatio,1/2));
			collider.overlapOnly = true;

			goAhead = true; //The answer is correct
			noAnswer = false; //An answer has been given
		} else if (level == levelsQueue[1]) { //Go down
					//console.log("jump Down!", level);
					player.body.setGravityY(playerGravity);
					player.setVelocityY(-1*Math.pow(2*(gravity+playerGravity)*stepHeight*1,1/2));
					goAhead = true;
					noAnswer = false;
				}
				//Else go ahead remain false and the player fall down

	}
	else if(level == -1 && player.body.touching.down && gameStatus=="Running") {
					//goAhead = false; //The player fall down if a wrong note is singed (even out of the jump area)
					player.body.setGravityY(playerGravity);
				}
}
