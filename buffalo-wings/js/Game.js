"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    //let bouncy = null;
    let chicken = null;
    let enemies;
    

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

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

            enemies = game.add.group();
            for(let i = 0; i<7; i++)
            {
                chicken = game.add.sprite(0,0,'sprites','chicken.png');
                let face = game.add.sprite(2,73,'sprites', this.rnd.integerInRange(1,6));
                let hat = game.add.sprite(-30,-15,'sprites', this.rnd.integerInRange(8,13));
                chicken.inputEnabled = true;
                chicken.addChild(face);
                chicken.addChild(hat);
                chicken.pivot.set(89,169);
                enemies.add(chicken);
                let myscalex = (chicken.width)*(game.width/1920);
                let myscaley = (chicken.height)*(game.height/1080);
                let myscale = Math.min(myscalex, myscaley)*.75;
                console.log(myscale);
                chicken.scale.set(myscale/100,myscale/100);
                chicken.position.set(this.rnd.integerInRange(0,game.width),game.height);
                //console.log(game.width);
                //console.log(chicken.position.x);
            }

            chicken = game.add.sprite(0,0,'sprites', 'chicken.png');
            let face = game.add.sprite(2,73,'sprites', this.rnd.integerInRange(1,6));
            let hat = game.add.sprite(-30,-15,'sprites', this.rnd.integerInRange(8,13));
            chicken.inputEnabled = true;
            chicken.addChild(face);
            chicken.addChild(hat);

            chicken.pivot.set(89,169);

            chicken.scale.set(0.75,0.75);

            
            // Turn on the arcade physics engine for this sprite.
            //game.physics.enable( bouncy, Phaser.Physics.ARCADE );
            game.physics.enable(chicken, Phaser.Physics.ARCADE);
            // Make it bounce off of the world bounds.
            chicken.body.collideWorldBounds = true;
            
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.
            var style = { font: "25px Verdana", fill: "#000000", align: "center" };
            var name = generateName();
            var text = game.add.text( game.world.centerX, 15, name, style );
            text.anchor.setTo( 0.5, 0.0 );
            
            // When you click on the sprite, you go back to the MainMenu.
            //bouncy.inputEnabled = true;
            chicken.inputEnabled = true;
            chicken.events.onInputDown.add(function(){
                console.log("clicked the chicken");
                text.setText(generateName());
                face.frame = this.rnd.integerInRange(1,6);
                hat.frame = this.rnd.integerInRange(8,13);
            },this);
        },
    
        update: function () {
    
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            
            // Accelerate the 'logo' sprite towards the cursor,
            // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
            // in X or Y.
            // This function returns the rotation angle that makes it visually match its
            // new trajectory.
            //let rotate = game.physics.arcade.accelerateToPointer(chicken, game.input.activePointer, 500, 500, 500 );
        },

        
    };
};
