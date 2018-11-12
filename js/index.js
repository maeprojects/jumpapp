var resolution = [800, 600]
var gravity = 330;

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
var startingPoint = false;
var worldWidth = 0;
var gameContext;

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('ground', 'assets/platform.png');
	this.load.image('star', 'assets/star.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
	//this.add.image(-400, 300, 'sky');
	this.add.image(400, 300, 'sky');
	this.add.image(1200, 300, 'sky');
	
	
	this.physics.world.setBounds(0, 0, 1600, 600);
	worldWidth = this.physics.world.bounds.width;
	
	
	//Platforms creation
	platforms = this.physics.add.staticGroup();
	
	platforms.create(400,568, 'ground').setScale(2).refreshBody();
	platforms.create(-400,568, 'ground').setScale(2).refreshBody();
	platforms.create(1200,568, 'ground').setScale(2).refreshBody();
	
	platforms.create(600, 400, 'ground');
    platforms.create(750, 220, 'ground');
	platforms.create(1200, 300, 'ground');
	

	//Player Creation
	player = this.physics.add.sprite(10, 220, 'dude');
	
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300);
	player.setDepth(50);
	
	
	//Player Animations Creation
	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'dude', frame: 4 } ],
		frameRate: 20
	});
		
	
	//Creation of colliders btw player and game field
	this.physics.add.collider(player, platforms);
		
	
	//Adding score
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
	scoreText.setText('score: ' + score);
	
	
	//Create cursors to move the player with arrows
	cursors = this.input.keyboard.createCursorKeys();

	
    //Set Camera Bounds
    this.cameras.main.setBounds(-300, 0, 5000, 0);
	
    //Make the camera follow the player
    this.cameras.main.startFollow(player);
	this.cameras.main.setFollowOffset(-300, 0);
	
	//Needed to use THIS on the following functions
	gameContext = this;
}

function update ()
{
	if (cursors.up.isDown && player.body.touching.down)
	{
		player.setVelocityY(-480);
	}
	
	if(startingPoint) {
		player.setVelocityX(130);
		player.anims.play('right', true);
	} else if(player.getBottomLeft().y == 536){
		startingPoint = true;
	} else {
		player.anims.play('turn', true);
	}
	
	
	if(player.getBottomLeft().x > worldWidth-760 && player.getBottomLeft().x < worldWidth-755){
		updateWorld();
	}
}

function updateWorld () {
	
	gameContext.add.image(worldWidth+400, 300, 'sky');
	gameContext.add.image(worldWidth+1200, 300, 'sky');
	gameContext.physics.world.setBounds(0, 0, worldWidth+1600, 600);	
	gameContext.cameras.main.setBounds(-300, 0, worldWidth+3000, 0);
	
	platforms.create(worldWidth+400,568, 'ground').setScale(2).refreshBody();
	platforms.create(worldWidth+1200,568, 'ground').setScale(2).refreshBody();
	
	platforms.create(worldWidth+600, 400, 'ground');
    platforms.create(worldWidth+850, 220, 'ground');
	platforms.create(worldWidth+1200, 300, 'ground');
	
	//Update width
	worldWidth = gameContext.physics.world.bounds.width;
}

document.onclick = function () {
	if(player.body.touching.down){
		player.setVelocityY(-480);
	}
}