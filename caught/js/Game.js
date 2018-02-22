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
            this.axis = false;
            this.bmd = game.add.bitmapData(game.width, game.height);
            this.sprite = game.add.sprite(0,0,this.bmd);

            let graphics = game.add.graphics(0,0);
            graphics.beginFill(0xd8880f,0.5);
            graphics.lineStyle (4, 0xd8880f, 0);
            graphics.drawRect(game.rnd.between(-0,game.width-128), game.rnd.between(-0,game.height-128), 128, 128);
            graphics.endFill();

            graphics.beginFill(0x20d870,0.5);
            graphics.lineStyle (4, 0x20d870, 0);
            graphics.drawRect(game.rnd.between(-0,game.width-128), game.rnd.between(-0,game.height-128), 128, 128);
            graphics.endFill();

            graphics.beginFill(0x762fd8,0.5);
            graphics.lineStyle (4, 0x762fd8, 0);
            graphics.drawRect(game.rnd.between(-0,game.width-128), game.rnd.between(-0,game.height-128), 128, 128);
            graphics.endFill();

            this.butterflies = game.add.physicsGroup();

            this.butterfly1 = game.add.sprite(15,15, 'butterfly1');
            this.butterfly2 = game.add.sprite(game.width-200,15, 'butterfly2');
            this.butterfly3 = game.add.sprite(game.width/2,game.height-100, 'butterfly3');

            this.butterflies.add(this.butterfly1);
            this.butterflies.add(this.butterfly2);
            this.butterflies.add(this.butterfly3);

            this.butterfly1.body.velocity.setTo(game.rnd.between(-400,400),game.rnd.between(-400,400));
            this.butterfly1.body.collideWorldBounds = true;
            this.butterfly1.body.bounce.set(1);

            this.butterfly2.body.velocity.setTo(game.rnd.between(-400,400),game.rnd.between(-400,400));
            this.butterfly2.body.collideWorldBounds = true;
            this.butterfly2.body.bounce.set(1);

            this.butterfly3.body.velocity.setTo(game.rnd.between(-400,400),game.rnd.between(-400,400));
            this.butterfly3.body.collideWorldBounds = true;
            this.butterfly3.body.bounce.set(1);

            //the eventual wall graphics will be these lines
            this.walls = game.add.physicsGroup();
            
            game.stage.backgroundColor="#8ab6fc";
            game.input.onDown.add(this.drawWall, this);

            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            let text = game.add.text( game.world.centerX, 15, "Trap butterflies in the correct places!\nTry to use as few lines as possible!", style );
            text.anchor.setTo( 0.5, 0.0 );
        },

        bounce: function(butterfly, walls){
            //console.log("bounced");
        },

        drawWall: function(){
            if(this.axis){
                let wall = game.add.sprite(0,game.input.activePointer.y-2);
                this.walls.add(wall);
                wall.body.immovable = true;
                wall.body.setSize(game.width, 4, 0, 0);
            }else{
                let wall = game.add.sprite(game.input.activePointer.x-2, 0);
                this.walls.add(wall);
                wall.body.immovable = true;
                wall.body.setSize(4, game.height, 0, 0);
            }
            this.axis = !this.axis;
        },
    
        drawX: function(){
            this.bmd.ctx.beginPath();
            this.bmd.ctx.moveTo(0,game.input.activePointer.y);
            this.bmd.ctx.lineTo(game.width, game.input.activePointer.y);
            this.bmd.ctx.lineWidth = "4";
            this.bmd.ctx.strokeStyle = 'white';
            this.bmd.ctx.stroke();
            this.bmd.ctx.closePath();
            this.bmd.render();
        },
        drawY: function(){
            this.bmd.ctx.beginPath();
            this.bmd.ctx.moveTo(game.input.activePointer.x, 0);
            this.bmd.ctx.lineTo(game.input.activePointer.x, game.height);
            this.bmd.ctx.lineWidth = "4";
            this.bmd.ctx.strokeStyle = 'white';
            this.bmd.ctx.stroke();
            this.bmd.ctx.closePath();
            this.bmd.render();
        },

        update: function () {
            this.bmd.clear();
            if(this.axis)
            this.drawX();
            else
            this.drawY();
            this.bmd.update();

            game.physics.arcade.collide(this.butterflies, this.walls, this.bounce);
            //console.log("X: "+this.input.activePointer.x);
            //console.log("Y: "+this.input.activePointer.y);
        },

        render: function () {
            //game.debug.geom(linex);
            //game.debug.geom(liney);
            //game.debug.lineInfo(linex, 32, 32);

            game.debug.physicsGroup(this.walls, "#bbbbbb");
            //game.debug.body(this.butterfly1);
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