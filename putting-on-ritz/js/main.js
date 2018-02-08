"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    let game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        game.stage.backgroundColor = '#002560';

        game.load.image('ball', 'assets/ball.png');
        game.load.image('platform', 'assets/platform.png');

        game.load.image('player', 'assets/golfer.png');
	}
    
    let player;
    let platforms;

    let jump;
    let sprint;
    let crouch;
    let left;
    let right;

    let accel = 70;
    let decel = 35;
    // the ball you are about to fire
    let ball;
    // the origin of the click for mouse drag
    let origin;
 
    // the rectangle where you can place the ball and charge the launch power
    let launchRectangle = new Phaser.Rectangle(250, 250, 200, 150);
    
    // here we will draw the predictive trajectory
    let trajectoryGraphics;
    
    // a simply multiplier to increase launch power
    let forceMult = 5;
    
    // here we will store the launch velocity
    let launchVelocity;
    
    function create() {
        player = game.add.sprite(100, 200, 'player');

        game.physics.arcade.enable(player);

        player.body.collideWorldBounds = true;
        player.body.allowDrag = true;
        this.game.physics.arcade.gravity.y = 2400;
        player.body.maxVelocity.x = 300;
        player.body.maxVelocity.y = 1800;

        platforms = game.add.physicsGroup();

        platforms.create(500, 150, 'platform');
        platforms.create(-200, 300, 'platform');
        platforms.create(400, 450, 'platform');

        platforms.setAll('body.immovable', true);
        platforms.setAll('body.allowGravity', false);

        jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        sprint = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        crouch = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        left = game.input.keyboard.addKey(Phaser.Keyboard.A);
        right = game.input.keyboard.addKey(Phaser.Keyboard.D);

        trajectoryGraphics = game.add.graphics(0, 0);
        launchVelocity = new Phaser.Point(0, 0);

        game.input.onDown.add(placeBall);
    }
    
    function placeBall(e)
    {
        ball = game.add.sprite(player.x+player.width/2, player.y+player.height-16, "ball");
        // enabling physics on ball sprite
        game.physics.arcade.enable(ball);
        ball.body.allowGravity = false;
        origin = new Phaser.Point(e.x, e.y);
        // removing onDown listener
        game.input.onDown.remove(placeBall);
        // when the player ends the input call launchBall function
        game.input.onUp.add(launchBall);
        // when the player moves the input call chargeBall
        game.input.addMoveCallback(chargeBall);
    }

    // this function will allow the player to charge the ball before the launch, and it's the core of the example
    function chargeBall(pointer, x, y, down){
        // we do not allow multitouch, so we are only handling pointer which id is zero
        if(pointer.id == 0){
            // clearing trajectory graphics, setting its line style and move the pen on ball position
            trajectoryGraphics.clear();
            trajectoryGraphics.lineStyle(3, 0x00ff00);
            trajectoryGraphics.moveTo(origin.x, origin.y);
            // now we have two options: the pointer is inside the launch rectangle...
            if(true){
                // ... and in this case we simply draw a line to pointer position
                trajectoryGraphics.lineTo(x, y);
                launchVelocity.x = origin.x - x;
                launchVelocity.y = origin.y - y;               
            }
            // ... but the pointer cal also be OUTSIDE launch rectangle
            else{
                // ... in this case we have to check for the intersection between launch line and launch rectangle
                var intersection = lineIntersectsRectangle(new Phaser.Line(x, y, ball.x, ball.y), launchRectangle);
                trajectoryGraphics.lineTo(intersection.x, intersection.y);
                launchVelocity.x = origin.x - intersection.x;
                launchVelocity.y = origin.y - intersection.y;
            } 
            // now it's time to draw the predictive trajectory  
            trajectoryGraphics.lineStyle(1, 0x00ff00);  
            launchVelocity.multiply(forceMult, forceMult);
            for (var i = 0; i < 180; i += 3){
                var trajectoryPoint = getTrajectoryPoint(ball.x, ball.y, launchVelocity.x, launchVelocity.y, i);
                trajectoryGraphics.moveTo(trajectoryPoint.x - 3, trajectoryPoint.y - 3); 
                trajectoryGraphics.lineTo(trajectoryPoint.x + 3, trajectoryPoint.y + 3);
                trajectoryGraphics.moveTo(trajectoryPoint.x - 3, trajectoryPoint.y + 3);  
                trajectoryGraphics.lineTo(trajectoryPoint.x + 3, trajectoryPoint.y - 3);        
            }     
        }
    }

    // function to launch the ball
    function launchBall(){
        // adjusting callbacks
        game.input.deleteMoveCallback(0);
        game.input.onUp.remove(launchBall);
        game.input.onDown.add(placeBall);
        // setting ball velocity
        ball.body.velocity.x = launchVelocity.x;
        ball.body.velocity.y = launchVelocity.y;
        // applying the gravity to the ball
        ball.body.allowGravity = true;  
    }

    // function to calculate the trajectory point taken from http://phaser.io/examples/v2/arcade/projected-trajectory
    function getTrajectoryPoint(startX, startY, velocityX, velocityY, n) {
        var t = 1 / 60;    
       
        let tpy = startY + (velocityY*t*n) + 1/2*(game.physics.arcade.gravity.y)*(t*t*n*n); 
        let tpx = startX + velocityX*t*n;    
        return {
            x: tpx, 
            y: tpy 
        };
    }
    
    function update() {
        game.physics.arcade.collide(player, platforms);

        player.body.acceleration.x = 0;
        if (left.isDown)
        {
            player.body.velocity.x -= accel;
        }
        else if (right.isDown)
        {
            player.body.velocity.x += accel;
        }
        else if (!left.isDown && !right.isDown)
        {
            let usedecel;
            if(player.body.onFloor())
            {
                usedecel = decel;
            }else
            {
                usedecel = decel/2;
            }
            if(player.body.velocity.x > usedecel)
                player.body.velocity.x -= usedecel;
            else if(player.body.velocity.x < (0-usedecel))
                player.body.velocity.x += usedecel;
            else
                player.body.velocity.x = 0;
        }

        if (jump.isDown && (player.body.onFloor() || player.body.touching.down))
        {
            player.body.velocity.y = -900;
        }

        if(sprint.isDown){
            player.body.maxVelocity.x = 600;
        }
        else if(crouch.isDown){
            player.body.maxVelocity.x = 150;
        }
        else{
            player.body.maxVelocity.x = 300;
        }
    }
    
    function render () {

    }
};
