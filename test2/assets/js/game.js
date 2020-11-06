
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            //debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let platforms;

let cursors;

let score = 0;
let scoreText;

function preload ()
{
    this.load.image('sky', 'assets/img/sky.png');
    this.load.image('ground', 'assets/img/platform.png');
    this.load.image('star', 'assets/img/star.png');
    this.load.image('bomb', 'assets/img/bomb.png');

    this.load.spritesheet('dude', 'assets/img/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create ()
{
    // the objects are always positioned base of their center
    this.add.image(400, 300, 'sky');
    // but we can use setOrigin (or originX / originY) to set a new origin
    // ex: this.add.image(0, 0, 'sky').setOrigin(0, 0)
    // would reset the origin position to the left top corner

    // defining static & physic platforms
    // (gravity don't apply on them but their body is physic)
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // set the phisic sprite of the character
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // create animations with the sprite sheet
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
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

    // create a collision between the player and the platforms
    this.physics.add.collider(player, platforms);

    // create keyboard control
    cursors = this.input.keyboard.createCursorKeys();
    console.log(cursors);

    // create the group of stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate((child) => {
        // iterate between the stars and generate random bouncing
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // create collision between the stars and the platforms
    this.physics.add.collider(stars, platforms);

    // check if the player is touching a star
    // if true call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // setup the score text game object
    scoreText = this.add.text(16, 16, 'score: ' + score, { fontSize: '32px', fill: '#000' });

    // set the bombs physic group
    bombs = this.physics.add.group();
    // create collision with the platforms
    this.physics.add.collider(bombs, platforms);
    // check if the player is touching a bomb
    // if true call to the hitBomb function
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    // make the collected star disapear
    star.disableBody(true, true);
    // modify the score
    score += 10;
    // and display the updated score
    scoreText.setText('Score: ' + score);

    // if all the stars are collected
    if (stars.countActive(true) === 0)
    {
        // iterate the stars group to re-activate them
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true);
        });
        // check where is the player (in x) and set a random location of the opposite side of the scene
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        // generate a new bomb on the random location
        let bomb = bombs.create(x, 16, 'bomb');
        // setup bouncing
        bomb.setBounce(1);
        // setup collisions
        bomb.setCollideWorldBounds(true);
        // setup a random velocity
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb (player, bomb)
{
    // stop the game
    this.physics.pause();
    // turn the player red
    player.setTint(0xff0000);
    // activate the "turn" animation
    player.anims.play('turn');
    // end the game
    gameOver = true;
}