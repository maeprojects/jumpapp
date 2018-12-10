var config = {
	type: Phaser.AUTO, //Choose between Phaser.CANVAS and Phaser.WEBGL
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
				gravity: { y: 330 },
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

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('ground', 'assets/platform.png');
	this.load.image('star', 'assets/star.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); //As a sprite sheet, not an image. That is because it contains animation frames. 
}

function create ()
{
	this.add.image(-400, 300, 'sky');
	this.add.image(400, 300, 'sky'); //Add the image to the scene: the position is relative to the center of the image
	this.add.image(1200, 300, 'sky');
	this.add.image(2000, 300, 'sky');
	
	//this.add.image(0, 0, 'sky').setOrigin(0, 0) //Set the anchor of the image to the top left and position it to the top left of the scene
	
	/*In Arcade Physics there are two types of physics bodies: Dynamic and Static. 
	A dynamic body is one that can move around via forces such as velocity or acceleration. 
	It can bounce and collide with other objects and that collision is influenced by the mass 
	of the body and other elements.

	In stark contrast, a Static Body simply has a position and a size. It isn't touched by gravity, 
	you cannot set velocity on it and when something collides with it, it never moves. 
	Static by name, static by nature. And perfect for the ground and platforms that we're going to let the player run around on.

	But what is a Group? As their name implies they are ways for you to group together similar objects and control 
	them all as one single unit. You can also check for collision between Groups and other game objects. 
	Groups are capable of creating their own Game Objects via handy helper functions like create. 
	A Physics Group will automatically create physics enabled children, saving you some leg-work in the process.
	*/
	
	this.physics.world.setBounds(0, 0, 1600, 600);
	
	
	platforms = this.physics.add.staticGroup();
	
	platforms.create(400,568, 'ground').setScale(2).refreshBody();
	platforms.create(-400,568, 'ground').setScale(2).refreshBody();
	platforms.create(1200,568, 'ground').setScale(2).refreshBody();
	
	platforms.create(600, 400, 'ground');
    platforms.create(750, 220, 'ground');
	platforms.create(1200, 300, 'ground');
	

	
	//Creation of the player
	player = this.physics.add.sprite(10, 220, 'dude'); //positioned at 100 x 450 pixels from the top of the game
	
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300); //Set gravity as "acceleration"
	
	
	//Animations Setting
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
		frameRate: 10, //10 frames per second
		repeat: -1 //loop=true
	});

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'dude', frame: 4 } ],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	});
	
	
	
	//Creation of colliders btw player and game field
	this.physics.add.collider(player, platforms);	
	
	
	//Adding Stars
	stars = this.physics.add.group({
		key: 'star', //First it sets the texture key to be the star image
		repeat: 11, //Then it sets the repeat value to be 11. Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total
		setXY: { x: 12, y: 0, stepX: 70 }
	});

	stars.children.iterate(function (child) {

		child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

	});
	
	
	//Collider for stars and platforms
	this.physics.add.collider(stars, platforms);
	
	//Overlap btw player and stars: call function: collectStar
	this.physics.add.overlap(player, stars, collectStar, null, this);
	
	
	
	//Adding score
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
	scoreText.setText('score: ' + score);
	
	
	//Adding Bombs
	bombs = this.physics.add.group();
	this.physics.add.collider(bombs, platforms);
	this.physics.add.collider(player, bombs, hitBomb, null, this);
	
	//Create cursors to move the player with arrows
	cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(-300, 0, 5000, 0);
	
    // make the camera follow the player
    this.cameras.main.startFollow(player);
	this.cameras.main.setFollowOffset(-300, 0);
}

function hitBomb(player, bomb){
	this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;	
}

function collectStar (player, star)
{
    star.disableBody(true, true);
	score += 10;
    scoreText.setText('score: ' + score);
	
	if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(50, 200), 0);
        bomb.allowGravity = false;

    }
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
	
}