"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.

    let player;
    let platforms;

    //the input keys
    let jump;
    let sprint;
    let crouch;
    let left;
    let right;

    let accel = 70;
    let decel = 35;
    // the ball you are about to fire
    let ball;

    let charging;
    // the origin of the click for mouse drag
    let origin;
    // the currently dragged mouse pointer
    let pointer;

    // here we will draw the predictive trajectory
    let currentTrajectoryGraphics;
    let currentAimGraphics;

    // here we will draw the previous shot
    let lastTrajectoryGraphics;
    let lastAimGraphics;


    // a simple multiplier to increase launch power
    let forceMult = 10;

    // here we will store the launch velocity
    let launchVelocity;

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    //put a ball at the feet of the player
    function placeBall(e)
    {
        ball = game.add.sprite(0, 0, 'ball');
        ball.position.setTo(player.x+player.width/2-ball.width/2, player.y+player.height-ball.height);
        // enabling physics on ball sprite
        origin = new Phaser.Point(e.x, e.y);
        pointer = new Phaser.Point(e.x, e.y);
        // removing onDown listener
        game.input.onDown.remove(placeBall);
        // when the player ends the input call launchBall function
        game.input.onUp.add(launchBall);

        game.input.addMoveCallback(onMouseDrag);
        charging = true;
    }

    function onMouseDrag(pointer, x, y, down){
        if(pointer.id == 0){
            pointer.x = x;
            pointer.y = y;

            launchVelocity.x = origin.x - x;
            launchVelocity.y = origin.y - y;   
        }
        if(charging){
            currentAimGraphics.clear();
            currentAimGraphics.lineStyle(1, 0x000000, 0.75);
            currentAimGraphics.beginFill(0x000000, 0.25);
            currentAimGraphics.drawCircle(origin.x, origin.y, 256);
            currentAimGraphics.endFill();
            currentAimGraphics.lineStyle(3, 0x00ff00);
            currentAimGraphics.moveTo(origin.x, origin.y);
            // ... draw a line from origin to pointer position
            currentAimGraphics.lineTo(pointer.x, pointer.y);
        }
    }


    // this function will allow the player to charge the ball before the launch, and it's the core of the example
    function drawTrajectory(){
        // we do not allow multitouch, so we are only handling pointer which id is zero
         ball.position.setTo(player.x+player.width/2-ball.width/2, player.y+player.height-ball.height);
                        
            //the current alpha
            let currentAlpha = 1;
            //this is how many points in the trajectory graph
            let numberOfPoints = 16;
            currentTrajectoryGraphics.clear();
            for (var i = 0; i < numberOfPoints; i++){
                currentTrajectoryGraphics.lineStyle(1,0xffffff, currentAlpha);
                var trajectoryPoint = getTrajectoryPoint(player.x+player.width/2, player.y+player.height-8, launchVelocity.x*forceMult, launchVelocity.y*forceMult, i*3);
                currentTrajectoryGraphics.drawCircle(trajectoryPoint.x, trajectoryPoint.y, 6);
                currentAlpha -= 1/numberOfPoints;   
            }     
        
    }

    // function to launch the ball
    function launchBall(){
        // adjusting callbacks
        charging = false;
        game.input.deleteMoveCallback(0);
        game.input.onUp.remove(launchBall);
        game.input.onDown.add(placeBall);
        game.physics.arcade.enable(ball);
        // setting ball velocity
        ball.body.velocity.x = launchVelocity.x * forceMult;
        ball.body.velocity.y = launchVelocity.y * forceMult;
        lastTrajectoryGraphics = currentTrajectoryGraphics;
    }

    function getTrajectoryPoint(startX, startY, velocityX, velocityY, n) {
        var t = 1 / 60;    
       
        let tpy = startY + (velocityY*t*n) + 1/2*(game.physics.arcade.gravity.y)*(t*t*n*n); 
        let tpx = startX + velocityX*t*n;    
        return {
            x: tpx, 
            y: tpy 
        };
    }

    return {
        
        create: function () {
            //set world background
            game.stage.backgroundColor = '#002560';
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

            currentTrajectoryGraphics = game.add.graphics(0, 0);
            lastTrajectoryGraphics = game.add.graphics(0, 0);
            currentAimGraphics = game.add.graphics(0, 0);
            lastAimGraphics = game.add.graphics(0, 0);
            launchVelocity = new Phaser.Point(0, 0);

            game.input.onDown.add(placeBall);
        },

        update: function () {
            if(charging){
               // drawShot();
                drawTrajectory();
            }
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
            
        },

        render: function () {

        }
        
    };
};

GameStates.makeGameOver = function( game, shared ) {
    
    return {
    
        create: function () {
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            //music = game.add.audio('titleMusic');
            //music.play();

            game.input.onDown.add( function() {
                //game.state.add( 'Game', GameStates.makeGame( game, shared ) );
                game.state.start('MainMenu');
            }, this );
    
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.
            if(shared.lastscore>shared.highscore){
                shared.highscore = shared.lastscore;
            }
            var style = { font: "25px Verdana", fill: "#000000", align: "center" };
            var text = game.add.text( game.world.centerX, 15,
                "Game over! \nYour score: " + shared.lastscore+"\nYour high score: "+ shared.highscore + "\n\n Click to return to menu.",
                style );
            text.anchor.setTo( 0.5, 0.0 );
        },
    
        update: function () {
    
            //	Do some nice funky main menu effect here
            
        }
        
    };
};