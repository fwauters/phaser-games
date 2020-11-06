//-------------- First Phaser Game ---------------

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 550,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

//------------------ Variables -------------------

let ship;
let asteroid;
let cursors;
let time = 0;
let scoreText;
let gameOver = false;
let scoreInterval;
let gameInterval;

//------------------ Functions -------------------

function preload ()
{
    this.load.image('space', 'assets/img/space.png');
    this.load.image('ship', 'assets/img/spacecraft.png');
    this.load.image('asteroid', 'assets/img/asteroid_small.png');
}

function create ()
{
    this.add.image(400, 275, 'space');

    ship = this.physics.add.image(400, 500, 'ship');
    ship.setCollideWorldBounds(true);
    console.log(ship.body);

    cursors = this.input.keyboard.createCursorKeys();
    console.log(cursors);

    scoreText = this.add.text(16, 16, 'Score: ' + time, { fontSize: '32px', fill: '#fff' });
    
    timer(time, gameOver);

    asteroids = this.physics.add.group();
    asteroidGenerator (ship, gameOver);
    this.physics.add.collider(ship, asteroids, hitAsteroid, null, this);
}

function update ()
{
    ship.setVelocity(0, 0);

    if (cursors.up.isDown)
    {
        ship.setVelocity(0, -300);
    }
    if (cursors.down.isDown)
    {
        ship.setVelocity(0, 150);
    }
    if (cursors.left.isDown)
    {
        ship.setVelocity(-200, 0);
    }
    if (cursors.right.isDown)
    {
        ship.setVelocity(200, 0);
    }
}

function timer (time, gameOver)
{
    if (gameOver === false)
    {
        scoreInterval = setInterval(() => {
            time ++;
            scoreText.setText('Score: ' + time);
        }, 1000);
    }
    else if (gameOver === true)
    {
        clearInterval(scoreInterval);
    }
}

function asteroidGenerator (ship, gameOver)
{
    if (gameOver === false)
    {
        gameInterval = setInterval(() => {
            let x = (ship.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            // generate a new bomb on the random location
            let asteroid = asteroids.create(x, -40, 'asteroid');
            asteroid.body.isCircle = true;
            asteroid.setVelocityY(300);
        }, 5000);
    }
    else if (gameOver === true)
    {
        clearInterval(gameInterval);
    }
}

function hitAsteroid (ship, time)
{
    // stop the game
    this.physics.pause();
    // turn the player red
    ship.setTint(0xff0000);
    // end the game
    gameOver = true;
    timer(time, gameOver);
    asteroidGenerator(ship, gameOver);
}