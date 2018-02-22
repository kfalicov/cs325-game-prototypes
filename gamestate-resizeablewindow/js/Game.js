"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    function createKeyboardMovement() {
        this.keyboardCursors = game.input.keyboard.createCursorKeys();
        this.moveSpeed = { x: 0, y: 0 }
    
        this.wasd = {
          up: game.input.keyboard.addKey(Phaser.Keyboard.W),
          down: game.input.keyboard.addKey(Phaser.Keyboard.S),
          left: game.input.keyboard.addKey(Phaser.Keyboard.A),
          right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };
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
        },
    
        update: function () {
    
        },

        
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