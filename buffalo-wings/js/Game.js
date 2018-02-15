"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    //let bouncy = null;
    let chicken = null;
    let enemies;
    
    let score = 0;

    let startingEnemies = 3;
    let incrementEnemies = 1;
    let maxEnemies = 20;

    let minVelocity = 100;
    let maxVelocity = 600;
    let scalemod = 1;

    let initialDelay = Phaser.Timer.SECOND*4;
    let secondsBetweenEnemyMod = 1;
    let timer;

    let mscore = 0;

    let text;
    let scoretext;
    let lastKilled = "Chickens are bandits!\nThis town can't handle more than " + maxEnemies + " chickens!";

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    function destroySprite (sprite){
        sprite.destroy();
        mscore++;
        scoretext.setText(mscore);
        lastKilled = "Killed " + generateName();
    }

    function createChicken() {
        

        //creates the chicken with face and hat
        let chicken = game.add.sprite(0,0,'sprites','chicken.png');
        let face = game.add.sprite(2,73,'sprites', game.rnd.integerInRange(1,6));
        let hat = game.add.sprite(-30,-15,'sprites', game.rnd.integerInRange(8,13));
        chicken.addChild(face);
        chicken.addChild(hat);

        //chooses a starting point for the chicken
        var side = Math.round(Math.random());
        var x;
        var y;
        
        if (side) {
            x = (Math.round(Math.random()) * (game.width+chicken.width))-chicken.width/2;
            y = Math.random() * game.height;
        } else {
            x = Math.random() * game.width;
            y = (Math.round(Math.random()) * (game.height+chicken.height))-chicken.height/2;
        }

        //center point is the gun (unused)
        chicken.pivot.set(89,169);
        
        //scale with browser
        let myscalex = (chicken.width)*(game.width/1920);
        let myscaley = (chicken.height)*(game.height/1080);
        let myscale = Math.min(myscalex, myscaley)*scalemod;
        //console.log(myscale);
        chicken.scale.set(myscale/100,myscale/100);

        //must be called before any physics, as physics was defined for the group 'enemies'
        enemies.add(chicken);

        let randomAngle = game.math.degToRad(game.rnd.angle());
        let randomVelocity = game.rnd.integerInRange(minVelocity, maxVelocity);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, chicken.body.velocity);

        chicken.position.set(x,y);
        //console.log(game.width);
        //console.log(chicken.position.x);
        chicken.inputEnabled = true;
        chicken.events.onInputDown.add(destroySprite, this);

        
    }

    function checkBoundaries(sprite) {
        if (sprite.right <  0-sprite.width/2) {
            sprite.x = game.width+sprite.width/2;
        } else if (sprite.left > game.width+sprite.width/2) {
            sprite.x = 0-sprite.width/2;
        } 
 
        if (sprite.y < 0-sprite.height/2) {
            sprite.y = game.height+sprite.height/2;
        } else if (sprite.y > game.height+sprite.height/2) {
            sprite.y = 0-sprite.height/2;
        }
    }
    
    return {
    
        create: function () {
            game.stage.backgroundColor="#ddbbbb"
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            
            // Create a sprite at the center of the screen using the 'logo' image.
            //bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            //bouncy.anchor.setTo( 0.5, 0.5 );
            timer = game.time.create(false);
            timer.loop(initialDelay, function(){
                for(var i=0;i<incrementEnemies;i++){
                    createChicken();
                }
                this.delay = initialDelay*secondsBetweenEnemyMod;
                secondsBetweenEnemyMod = Math.max(secondsBetweenEnemyMod-0.1, 0.1);
                //console.log(this.delay);
                scalemod = Math.max(scalemod-0.01, 0.05);
                maxVelocity+=10;
                incrementEnemies = Math.min(8, incrementEnemies+0.2);
                //console.log(incrementEnemies);
            }, this);
            timer.start();

            enemies = game.add.group();
            enemies.enableBody = true;
            enemies.physicsBodyType = Phaser.Physics.ARCADE;
            for(let i = 0; i<3; i++)
            {
                createChicken();
            }

            /* chicken = game.add.sprite(0,0,'sprites', 'chicken.png');
            let face = game.add.sprite(2,73,'sprites', this.rnd.integerInRange(1,6));
            let hat = game.add.sprite(-30,-15,'sprites', this.rnd.integerInRange(8,13));
            chicken.inputEnabled = true;
            chicken.addChild(face);
            chicken.addChild(hat); 

            chicken.pivot.set(89,169);

            chicken.scale.set(0.75,0.75);
            */
            
            // Turn on the arcade physics engine for this sprite.
            //game.physics.enable( bouncy, Phaser.Physics.ARCADE );
            //game.physics.enable(chicken, Phaser.Physics.ARCADE);
            // Make it bounce off of the world bounds.
            //chicken.body.collideWorldBounds = true;
            
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.
            var style = { font: "25px Verdana", fill: "#000000", align: "center" };
            text = game.add.text( game.world.centerX, 15, lastKilled, style );
            scoretext = game.add.text(game.width-40, game.height-40, mscore, style);
            text.anchor.setTo( 0.5, 0.0 );
            scoretext.anchor.setTo( 0.5, 0.0 );
            
            // When you click on the sprite, you go back to the MainMenu.
            //bouncy.inputEnabled = true;
            /* chicken.inputEnabled = true;
            chicken.events.onInputDown.add(function(){
                createChicken();
                //console.log("clicked the chicken");
                face.frame = this.rnd.integerInRange(1,6);
                hat.frame = this.rnd.integerInRange(8,13);
            },this); */
        },
    
        update: function () {
    
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            
            // Accelerate the 'logo' sprite towards the cursor,
            // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
            // in X or Y.
            // This function returns the rotation angle that makes it visually match its
            // new trajectory.
            //let rotate = game.physics.arcade.accelerateToPointer(chicken, game.input.activePointer, 500, 500, 500 );
            for(var i = 0, len = enemies.children.length; i<len; i++)
            {
                let current = enemies.children[i];
                checkBoundaries(current);
            }
            if(enemies.children.length>=maxEnemies){
                shared.lastscore = mscore;
                game.state.start('GameOver');
            }

            text.setText(lastKilled);
        },

        
    };
};

GameStates.makeGameOver = function( game, shared ) {

    function startGame(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        //music.stop();

        //	And start the actual game
        game.state.start('Game');

    }
    
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