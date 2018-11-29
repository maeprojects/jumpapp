//Settings
var resolution = [800, 600]
var gravity = 850;
var playerGravity = 400;
var gameVelocity = 1;
var numberOfLevels = 8;

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

//Game Variables
var score;
var scoreText;

var cursors;

var startedGame;
var pausedGame;
var restartScene;
var goAhead;
var platformTouched;
var gameOver;

var levelsFieldHeight;
var levels;
var platformVelocity;

var player;
var playerWidth;
var playerHeight;
var playerFixedX;
var playerInitialY;

var nextNote;
var currentNote;


var correctKeyPressed;
var jumpArea;
var jumpAreaWidth;

function preload ()
{	
	playerWidth = 32;
	playerHeight = 48;
	
	this.load.image('background', 'assets/background.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('gameover', 'assets/gameover.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: playerWidth, frameHeight: playerHeight });
}

function create ()
{	
	cursors = 0;
	
	score = 0;
	gameOver = false;
	restartScene = false;
	startedGame = false;
	pausedGame = false;
	goAhead = true;
	jumpArea = false;
	levels = [];
	platformVelocity = 0;
	playerFixedX = 200;
	playerInitialY = playerHeight/2;
	nextNote = 0;
	currentNote = 0;
	
	correctKeyPressed = true;
	
	jumpAreaWidth = playerWidth+30*gameVelocity;
	
	this.add.image(resolution[0]/2, resolution[1]/2, 'background').setAlpha(0.2);
	
	
	this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);
	
	//Player Creation
	player = this.physics.add.sprite(playerFixedX, playerInitialY, 'dude');
	
	player.setCollideWorldBounds(false);
	player.body.setGravityY(-gravity);
	
	
	//Platforms group creation
	platforms = this.physics.add.staticGroup();
	
	//First Platform creation
	
		//List of levels generation
		for (i = 1; i <= numberOfLevels; i++) { 
			levels[i-1] = i;
		}
		
		//Calculation of levels Field (Height of the scene in which levels can appear)
		levelsFieldHeight = resolution[1]-player.height*2;
		
		//Mapping of levels Notes and heights in the field		
		newRandomLevel = generateRandomLevel();
		levelValue = newRandomLevel[0];
		levelHeight = newRandomLevel[1];
		randomLevel = platforms.create(349, levelHeight, 'platform');
		randomLevel.note = levelValue;
		
		
		newRandomLevel = generateRandomLevel();
		levelValue = newRandomLevel[0];
		levelHeight = newRandomLevel[1];
		
		randomLevel = platforms.create(650, levelHeight, 'platform');
		randomLevel.note = levelValue;
	

	
	
	//Player Animations Creation
	this.anims.create({
		key: 'run',
		frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 9 }),
		frameRate: 15*Math.sqrt(gameVelocity),
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'stop',
		frames: [ { key: 'dude', frame: 1 } ],
		frameRate: 5
	});
		
	
	//Creation of colliders btw player and game field
	this.physics.add.collider(player, platforms, platformsColliderCallback);
		
	
	//Adding score
	scoreText = this.add.text(16, 16, 'score:       Enter/Space to start', { fontSize: '32px', fill: '#000' });
	scoreText.setScrollFactor(0);
	
	
	//Create cursors to move the player with arrows
	cursors = this.input.keyboard.createCursorKeys();
}

function update ()
{
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
					console.log("Current Note: ", currentNote);
					console.log("Next Note: ", nextNote);
				}
				
				
				
				//Current Platform Changed Event
				if(changedCurrentPlatform && !correctKeyPressed) { //decide if the player has to die or not, depending on correctKeyPressed
					goAhead = false;
				} else if(changedCurrentPlatform) { //Set currentNote
							currentNote = p.note;
							jumpArea = false;
							correctKeyPressed = false;
						}
				
				//jumpArea Setter when the player enter the jumpArea
				if(platformLeftBorder+platformWidth-jumpAreaWidth >= playerLeftBorder-gameVelocity && platformLeftBorder+platformWidth-jumpAreaWidth < playerLeftBorder) {
					jumpArea = true;
				}
			}
		})
		
		if(player.body.touching.down) {
			player.anims.play('run', true);
			platformVelocity = gameVelocity;
		}	
		else {
			player.anims.play('stop', true);
			platformTouched = false;
		}
		
		if(randomLevel.x < resolution[0]-randomLevel.width/2){
			
			newRandomLevel = generateRandomLevel();
			levelValue = newRandomLevel[0];
			levelHeight = newRandomLevel[1];
			console.log("New level\nLevel Value: ",levelValue, "\nLevel Height: ",levelHeight)
			randomLevel = platforms.create(resolution[0]+randomLevel.width/2, levelHeight, 'platform');
			randomLevel.note = levelValue;
		}
		
		if(player.y > resolution[1]+player.height/2) {
			platformVelocity = 0;
			if(!gameOver){
				this.add.image(resolution[0]/2, resolution[1]/2, 'gameover');
				gameOver = true;
				console.log("GameOver: ",gameOver);
				scoreText.setText('score: ' + score + '    Enter/Space to restart');
			}
		}
		
		if(restartScene) {
			this.scene.restart();
			restartScene = false;
			console.log("restartScene: ",restartScene);
		}
		
		if(!goAhead) {
			this.physics.world.colliders.destroy();
		}
	} else {
		player.anims.play('stop', true);
		scoreText.setText('score: ' + score + ' Game Paused, Enter/Space to resume...');
	}
}

var generateRandomLevel = function() {
	randomLevelValue = Math.floor(Math.random()*(levels.length))+1;
	currentLevelHeight = (((numberOfLevels+1)-randomLevelValue)*(levelsFieldHeight/numberOfLevels))+((levelsFieldHeight/numberOfLevels)/2)+(player.height-(levelsFieldHeight/numberOfLevels));

	return [randomLevelValue, currentLevelHeight];
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down) {
		console.log("Collide Event");
		score++;
		scoreText.setText('score: ' + score);
	}
	platformTouched = true;
}

document.onkeydown = function(event) {
	if(!event.repeat){
		if(event.key == "Enter" || event.key == " "){
			
			if(!startedGame){
				player.body.setGravityY(playerGravity);
				scoreText.setText('score: ' + score);
				startedGame = true;
				console.log("startedGame: ",startedGame);
			} else if(!gameOver){
				pausedGame = !pausedGame;
				scoreText.setText('score: ' + score);
				console.log("PausedGame: ",pausedGame);
			}
				
			if(gameOver) {
				player.y = -100; //Move the player and hide it
				score = 0;
				restartScene = true;
				goAhead = true;
				console.log("restartScene: ",restartScene);
				gameOver = false;
				console.log("gameOver: ",gameOver);
				startedGame = false;
				console.log("startedGame: ",startedGame);
				correctKeyPressed = true;
				console.log("correctKeyPressed: ",correctKeyPressed);
			}
		
		} else if(player.body.touching.down && !pausedGame && jumpArea) {
					jumpRatio = nextNote-currentNote+1;
					jumpKey = String(jumpRatio);
					if(event.key == nextNote && currentNote<=nextNote) { //Go up
						goAhead = true;
						correctKeyPressed = true;
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
						/* switch(jumpKey) {
							case "1":
								player.setVelocityY(-1*Math.pow(250*gameVelocity, 1/3)); //OK
								break;
							case "2":
								player.setVelocityY(-1*Math.pow(450*gameVelocity, 1/3)); //OK
								break; 
							case "3":
								player.setVelocityY(-1*Math.pow(600*gameVelocity, 1/3)); //OK
								break;
							case "4":
								player.setVelocityY(-1*Math.pow(750*gameVelocity, 1/3)); //OK
								break;
							case "5":
								player.setVelocityY(-1*Math.pow(830*gameVelocity, 1/3)); //OK
								break;
							case "6":
								player.setVelocityY(-1*Math.pow(950*gameVelocity, 1/3)); //OK
								break;
							case "7":
								player.setVelocityY(-1*Math.pow(1000*gameVelocity, 1/3)); //OK
								break;
							case "8":
								player.setVelocityY(-1*Math.pow(1090*gameVelocity, 1/3)); //OK
								break;
							default:
								break;
						} */
					} else if (event.key == nextNote) { //Go down
								player.setVelocityY(-300); //OK
								correctKeyPressed = true;
								goAhead = true;
							}
		}
	}
}