
//Settings
var resolution = [800, 600]
var gravity = 850;

var config = {
	type: Phaser.AUTO,
	width: resolution[0],
	height: resolution[1],
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

var score = 0;
var scoreText;
var gameOver = false;
var cursors = 0;
var card;
var landed = false;
var worldWidth = 0;
var gameContext;
var platformTouched;
var player;

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('ground', 'assets/ground.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('star', 'assets/star.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
	this.add.image(400, 300, 'sky');
	
	
	this.physics.world.setBounds(0, 0, 800, 600);
	worldWidth = this.physics.world.bounds.width;
	
	
	//Platforms creation
	platforms = this.physics.add.staticGroup();
	
	platforms.create(400,568, 'ground').setScale(2).refreshBody();
	
	randomLevel = platforms.create(900, Phaser.Math.Between(50, 420), 'platform');
	randomLevel.note = 3
	

	//Player Creation
	player = this.physics.add.sprite(10, 220, 'dude');
	
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300);
	
	//Player Animations Creation
	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 8 }),
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
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
	scoreText.setText('score: ' + score);
	scoreText.setScrollFactor(0);
	
	
	//Create cursors to move the player with arrows
	cursors = this.input.keyboard.createCursorKeys();
	
	//Needed to use THIS on the following functions
	gameContext = this;
}

function update ()
{
	platforms.getChildren().forEach(function(p){
		if(p.note != undefined){
			p.x = p.x - 3;
			p.body.x = p.body.x - 3;
		}
	})
	
	if (cursors.up.isDown && player.body.touching.down)
	{
		player.setVelocityY(-680);
	}
	
	if(player.body.touching.down) {
		player.anims.play('right', true);
	}	
	else {
		player.anims.play('turn', true);
		platformTouched = false;
	}
	
	if(randomLevel.x < 1000-randomLevel.width){
		randomLevel = platforms.create(1000, Phaser.Math.Between(50, 420), 'platform');
		randomLevel.note = 3;
	}
}

function platformsColliderCallback () {
	if(!platformTouched && player.body.touching.down) {
		console.log("Collide Event");
		score++;
		scoreText.setText('score: ' + score);
	}
	platformTouched = true;
}

document.onclick = function () {
	if(player.body.touching.down){
		player.setVelocityY(-680);
		platformTouched = false;
	}
}