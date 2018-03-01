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

    let hittableObjects;

    let charging;
    let dotRadius = 3;
    // the origin of the click for mouse drag
    let origin;
    //the circle that denotes limits of the shot power
    let circleArea = new Phaser.Circle(0,0,256);
    // the currently dragged mouse pointer
    let pointer;

    // here we will draw the predictive trajectory
    let trajectoryGraphics;
    let aimGraphics;

    let oldGraphics;


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

    //sets the current item to be the active hit item
    function setHittableObject(){
        let closestBall;
        let lowestDistance;
        hittableObjects.forEach(function(obj){
            let currentDistance = Phaser.Math.distance(obj.x, obj.y, player.x, player.y);
            if(currentDistance < lowestDistance || lowestDistance == null){
                lowestDistance = currentDistance;
                closestBall = obj;
            }
            if(obj.body.onFloor()){
                obj.body.drag.x = 250;
            }else{
                obj.body.drag.x = 0;
            }
        },this);
        //console.log(lowestDistance);
        if(closestBall != null && lowestDistance<50){
            ball = closestBall;
        }else{
            ball = null;
        }
    }

    //put a ball at the feet of the player
    function placeBall(e)
    {
        // enabling physics on ball sprite
        origin = new Phaser.Point(e.x, e.y);
        circleArea.x = e.x;
        circleArea.y = e.y;
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
            //check if mouse point is in the circle
            if(circleArea.contains(x, y)){
                //console.log("inside");
                pointer.x = x;
                pointer.y = y;
            }else{
                //console.log("outside");
                let angle = game.physics.arcade.angleBetween(origin, new Phaser.Point(x,y));
                //if pointer is outside circle, set pointer coords to intersect between that line and the circle edge
                circleArea.circumferencePoint(angle, false, pointer);
            }
            launchVelocity.x = origin.x - pointer.x;
            launchVelocity.y = origin.y - pointer.y;   
        }
        if(charging){
            aimGraphics.clear();
            aimGraphics.lineStyle(1, 0x000000, 0.75);
            aimGraphics.beginFill(0x000000, 0.25);
            aimGraphics.drawCircle(origin.x, origin.y, 256);
            aimGraphics.endFill();
            aimGraphics.lineStyle(2, 0xffffff);
            aimGraphics.moveTo(origin.x, origin.y);
            // ... draw a line from origin to pointer position
            aimGraphics.lineTo(pointer.x, pointer.y);
            aimGraphics.drawCircle(pointer.x, pointer.y, 10);
        }
        
    }


    // this function will allow the player to charge the ball before the launch, and it's the core of the example
    function drawTrajectory(){

        trajectoryGraphics.clear();
        if(ball != null){
            //the current alpha
            let currentAlpha = 1;
            //this is how many points in the trajectory graph
            let numberOfPoints = 16;
            for (var i = 0; i < numberOfPoints; i++){
                trajectoryGraphics.lineStyle(1, 0xffffff, currentAlpha);
                var trajectoryPoint = getTrajectoryPoint(ball.x, ball.y, launchVelocity.x*forceMult, launchVelocity.y*forceMult, i*3);
                trajectoryGraphics.drawCircle(trajectoryPoint.x, trajectoryPoint.y, dotRadius*2);
                currentAlpha -= 1/numberOfPoints;   
            }
        }
    }

    // function to launch the ball
    function launchBall(){
        // adjusting callbacks
        charging = false;
        game.input.deleteMoveCallback(onMouseDrag);
        game.input.onUp.remove(launchBall);
        game.input.onDown.add(placeBall);

        //temporarily allow world bound collision
        
        if(ball != null){
            // setting ball velocity
            ball.body.velocity.x = launchVelocity.x * forceMult;
            ball.body.velocity.y = launchVelocity.y * forceMult;
            ball.body.angularVelocity = 100 * (ball.body.velocity.x + ball.body.velocity.y);
        }
    }

    function getTrajectoryPoint(startX, startY, velocityX, velocityY, n) {
        var framerate = 1 / 60;
        var interval = n * framerate;
        var balloffset;
        if(ball != null){
            balloffset = ball.height;
        }else{
            balloffset = 16;
        }
        let tpy = startY + ((velocityY + balloffset + dotRadius) * interval) + 1/2*(game.physics.arcade.gravity.y)*(interval*interval); 
        let tpx = startX + velocityX*interval;    
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
            player.anchor.x = 0.5;
            player.anchor.y = 1;

            platforms = game.add.physicsGroup(Phaser.Physics.ARCADE);
            hittableObjects = game.add.physicsGroup(Phaser.Physics.ARCADE);

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
            //trajectoryGraphics.fixedToCamera = true;
            aimGraphics = game.add.graphics(0, 0);
            oldGraphics = game.add.sprite(0,0);
            launchVelocity = new Phaser.Point(0, 0);

            let temp = game.add.sprite(0, 100, 'ball');
            temp.anchor.x = 0.5;
            temp.anchor.y = 0.5;
            hittableObjects.add(temp);
            //ball.position.setTo(player.x+player.width/2-ball.width/2, player.y+player.height-ball.height);
            temp.body.bounce.set(0.25);
            temp.body.collideWorldBounds = true;

            game.input.onDown.add(placeBall);
        },

        update: function () {
            if(charging){
                setHittableObject();
                drawTrajectory();
            }
            
            game.physics.arcade.collide(player, platforms);
            game.physics.arcade.collide(hittableObjects);
            game.physics.arcade.collide(hittableObjects, platforms);

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
            game.debug.spriteBounds( oldGraphics, 'rgba(255,255,0,0.4)' ) ;
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