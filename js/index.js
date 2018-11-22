
//Settings
var resolution = [800, 600]
var gravity = 850;
var playerGravity = 400;
var gameVelocity = 3;
var levelsNumber = 8;

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
var score = 0;
var scoreText;
var gameOver = false;
var cursors = 0;
var card;
var startedGame = false;
var platformTouched;
var player;
var levelsFieldHeight;
var levels = [];
var platformVelocity = 0;
var playerWidth = 32;
var playerHeight = 48;
var playerLeftOffset = 200;
var playerInitialY = playerHeight/2;

function preload ()
{
	this.load.image('background', 'assets/background.png');
	this.load.image('ground', 'assets/ground.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('star', 'assets/star.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: playerWidth, frameHeight: playerHeight });
}

function create ()
{
	this.add.image(resolution[0]/2, resolution[1]/2, 'background').setAlpha(0.2);
	
	
	this.physics.world.setBounds(0, 0, resolution[0], resolution[1]);
	
	//Player Creation
	player = this.physics.add.sprite(playerLeftOffset, playerInitialY, 'dude');
	
	player.setCollideWorldBounds(false);
	player.body.setGravityY(-gravity);
	
	
	//Platforms group creation
	platforms = this.physics.add.staticGroup();
	
	//First Platform creation
	
		//List of levels generation
		for (i = 1; i <= levelsNumber; i++) { 
			levels[i-1] = i;
		}
		
		//Calculation of levels Field (Height of the scene in which levels can appear)
		levelsFieldHeight = resolution[1]-player.height*2;
		
		//Mapping of levels Notes and heights in the field		
		newRandomLevel = generateRandomLevel();
		levelValue = newRandomLevel[0];
		levelHeight = newRandomLevel[1];
		platforms.create(350, levelHeight, 'platform').note = levelValue;
		
		
		newRandomLevel = generateRandomLevel();
		levelValue = newRandomLevel[0];
		levelHeight = newRandomLevel[1];
		
		randomLevel = platforms.create(650, levelHeight, 'platform');
		randomLevel.note = levelValue;
	

	
	
	//Player Animations Creation
	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 15,
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'dude', frame: 4 } ],
		frameRate: 5
	});
		
	
	//Creation of colliders btw player and game field
	this.physics.add.collider(player, platforms, platformsColliderCallback);
		
	
	//Adding score
	scoreText = this.add.text(16, 16, 'score:       click to start', { fontSize: '32px', fill: '#000' });
	scoreText.setScrollFactor(0);
	
	
	//Create cursors to move the player with arrows
	cursors = this.input.keyboard.createCursorKeys();
}

function update ()
{
	platforms.getChildren().forEach(function(p){		
		if(p.note != undefined){
			p.x = p.x - platformVelocity;
			p.body.x = p.body.x - platformVelocity;
			if(p.x < -p.width-1000) p.destroy();
		}
	})
	
	if (cursors.up.isDown && player.body.touching.down)
	{
		player.setVelocityY(-680);
	}
	
	if(player.body.touching.down) {
		player.anims.play('right', true);
		platformVelocity = gameVelocity;
	}	
	else {
		player.anims.play('turn', true);
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
		score = 0;
		startedGame = false;
		this.scene.restart();
	}
}

var generateRandomLevel = function() {
	randomLevelValue = Math.floor(Math.random()*(levels.length))+1;
	currentLevelHeight = (((levelsNumber+1)-randomLevelValue)*(levelsFieldHeight/levelsNumber))+((levelsFieldHeight/levelsNumber)/2)+(player.height-(levelsFieldHeight/levelsNumber));
		
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

document.onclick = function canvasClick() {
	if(!startedGame){
		player.body.setGravityY(playerGravity);
		scoreText.setText('score: ' + score);
		startedGame = true;
	}
	
	if(player.body.touching.down){
		player.setVelocityY(-680);
		platformTouched = false;
	}
}