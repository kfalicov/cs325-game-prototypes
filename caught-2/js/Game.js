"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.

    let text;
    let resetbutton;

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    function restart(){
        game.state.add( 'Game', GameStates.makeGame( game, shared ) );
        game.state.start('Game');
    }

    function checkOverlap(spriteA, spriteB) {
        return (spriteA.position.x<spriteB.position.x+spriteB.width && spriteA.position.y<spriteB.position.y+spriteB.height);
    }

    return {
        
        create: function () {
            this.axis = false;
            this.bmd = game.add.bitmapData(game.width, game.height);
            this.sprite = game.add.sprite(0,0,this.bmd);

            this.flowers = game.add.physicsGroup();

            this.flower1 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-128), 'flower1');
            
            this.flower2 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-128), 'flower2');
            let i = 0;
            while(checkOverlap(this.flower2, this.flower1) && i <50){
                this.flower2.reset(game.rnd.between(0,game.width-128),game.rnd.between(0,game.height-128));
                console.log("moved flower2");
                i++;
            }
            this.flower3 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-128), 'flower3');
            let j = 0;
            while((checkOverlap(this.flower3, this.flower2) || checkOverlap(this.flower3, this.flower1)) && j < 50){
                this.flower3.reset(game.rnd.between(0,game.width-128),game.rnd.between(0,game.height-128));
                console.log("moved flower3");
                j++;
            }
            this.flowers.add(this.flower1);
            this.flowers.add(this.flower2);
            this.flowers.add(this.flower3);

            this.butterflies = game.add.physicsGroup();

            this.butterfly1 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-86), 'butterfly1');
            this.butterfly2 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-86), 'butterfly2');
            this.butterfly3 = game.add.sprite(game.rnd.between(0,game.width-128), game.rnd.between(0,game.height-86), 'butterfly3');

            this.butterflies.add(this.butterfly1);
            this.butterflies.add(this.butterfly2);
            this.butterflies.add(this.butterfly3);

            let randomAngle = game.rnd.integerInRange(20, 70) * game.rnd.integerInRange(1, 4);
            let randomVelocity = game.rnd.integerInRange(200, 400);
            game.physics.arcade.velocityFromAngle(randomAngle, randomVelocity, this.butterfly1.body.velocity);
            //this.butterfly1.body.collideWorldBounds = true;
            this.butterfly1.body.bounce.set(1);

            randomAngle = game.rnd.integerInRange(20, 70) * game.rnd.integerInRange(1, 4);
            randomVelocity = game.rnd.integerInRange(200, 400);
            game.physics.arcade.velocityFromAngle(randomAngle, randomVelocity, this.butterfly2.body.velocity);
            //this.butterfly2.body.collideWorldBounds = true;
            this.butterfly2.body.bounce.set(1);

            randomAngle = game.rnd.integerInRange(20, 70) * game.rnd.integerInRange(1, 4);
            randomVelocity = game.rnd.integerInRange(200, 400);
            game.physics.arcade.velocityFromAngle(randomAngle, randomVelocity, this.butterfly3.body.velocity);
            //this.butterfly3.body.collideWorldBounds = true;
            this.butterfly3.body.bounce.set(1);

            //the eventual wall graphics will be these lines
            this.walls = game.add.physicsGroup();

            //top border
            let wall0 = game.add.sprite(0,-4);
            this.walls.add(wall0);
            wall0.body.immovable = true;
            wall0.body.setSize(game.width, 4, 0, 0);

            //left border
            let wall1 = game.add.sprite(0-4, 0);
            this.walls.add(wall1);
            wall1.body.immovable = true;
            wall1.body.setSize(4, game.height, 0, 0);

            //bottom border
            let wall2 = game.add.sprite(0,game.height);
            this.walls.add(wall2);
            wall2.body.immovable = true;
            wall2.body.setSize(game.width, 4, 0, 0);

            //right border
            let wall3 = game.add.sprite(game.width, 0);
            this.walls.add(wall3);
            wall3.body.immovable = true;
            wall3.body.setSize(4, game.height, 0, 0);
            
            game.stage.backgroundColor="#8ab6fc";
            game.input.onDown.add(this.drawWall, this);

            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.world.centerX, 15, "Catch butterflies next to their favorite flowers!\nTry to use as few lines as possible!", style );
            text.anchor.setTo( 0.5, 0.0 );

            resetbutton = game.add.sprite(game.width/2, game.height/2, 'reset');
            resetbutton.anchor.setTo(0.5,0.5);
            resetbutton.inputEnabled = false;
            resetbutton.visible = false;
            resetbutton.events.onInputDown.add(restart, this);
        },

        bounce: function(butterfly, walls){
            if(!butterfly.caught){
                if(butterfly.body.touching.up){
                    butterfly.topY = butterfly.body.y;
                    //console.log(butterfly.topY);
                }
                if(butterfly.body.touching.down){
                    butterfly.bottomY = butterfly.body.y;
                    //console.log(butterfly.bottomY);
                }
                if(butterfly.body.touching.left){
                    butterfly.leftX = butterfly.body.x;
                    //console.log(butterfly.topY);
                }
                if(butterfly.body.touching.right){
                    butterfly.rightX = butterfly.body.x;
                    //console.log(butterfly.bottomY);
                }
                butterfly.totalYDistance = Math.abs(butterfly.topY-butterfly.bottomY);
                butterfly.totalXDistance = Math.abs(butterfly.leftX-butterfly.rightX);
                if(butterfly.totalXDistance<50 && butterfly.totalYDistance<50){
                    butterfly.caught = true;
                }
            }
            //console.log(butterfly.caught);
        },

        checkSeparation: function(axis){
            let i;
            for(i = 0; i<3;i++){
                let butterfly = this.butterflies.getAt(i);
                let flower = this.flowers.getAt(i);
                if(axis){
                    if(butterfly.bottom<game.input.activePointer.y && flower.top > game.input.activePointer.y){
                        text.text = "A butterfly can't reach its flower!";
                        resetbutton.inputEnabled = true;
                        resetbutton.visible = true;
                    }else if(butterfly.top>game.input.activePointer.y && flower.bottom < game.input.activePointer.y){
                        text.text = "A butterfly can't reach its flower!";
                        resetbutton.inputEnabled = true;
                        resetbutton.visible = true;
                    }
                }else{
                    if(butterfly.right<game.input.activePointer.x && flower.left > game.input.activePointer.x){
                        text.text = "A butterfly can't reach its flower!";
                        resetbutton.inputEnabled = true;
                        resetbutton.visible = true;
                    }else if(butterfly.left>game.input.activePointer.x && flower.right < game.input.activePointer.x){
                        text.text = "A butterfly can't reach its flower!";
                        resetbutton.inputEnabled = true;
                        resetbutton.visible = true;
                    }
                }
            }
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
            this.checkSeparation(this.axis);
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
            if(this.axis){
                this.drawX();
            }
            else{
                this.drawY();
            }
            this.bmd.update();

            if(this.butterfly1.caught){
                if(checkOverlap(this.butterfly1, this.flower1)){
                    text.text = "Good job! you caught the orange butterfly!";
                }else{
                    text.text = "You trapped a butterfly away from its flower!";
                    resetbutton.inputEnabled = true;
                    resetbutton.visible = true;
                }
            }

            if(this.butterfly2.caught){
                if(checkOverlap(this.butterfly2, this.flower2)){
                    text.text = "Good job! you caught the purple butterfly!";
                }else{
                    text.text = "You trapped a butterfly away from its flower!";
                    resetbutton.inputEnabled = true;
                    resetbutton.visible = true;
                }
            }

            if(this.butterfly3.caught){
                if(checkOverlap(this.butterfly3, this.flower3)){
                    text.text = "Good job! you caught the green butterfly!";
                }else{
                    text.text = "You trapped a butterfly away from its flower!";
                    resetbutton.inputEnabled = true;
                    resetbutton.visible = true;
                }
            }

            var count = 0;
            this.butterflies.forEach(function(item){
                if(item.caught){
                    count++;
                }
            }, this);
            if(count == 3){
                text.text = "Every butterfly is trapped!";
                resetbutton.inputEnabled = true;
                resetbutton.visible = true;
            }

            game.physics.arcade.collide(this.butterflies, this.walls, this.bounce);
            //console.log("X: "+this.input.activePointer.x);
            //console.log("Y: "+this.input.activePointer.y);
        },

        render: function () {
            //game.debug.geom(linex);
            //game.debug.geom(liney);
            //game.debug.lineInfo(linex, 32, 32);

            game.debug.physicsGroup(this.walls, "#bbbbbb");
            //game.debug.physicsGroup(this.flowers, "#ff000055");
            //game.debug.physicsGroup(this.butterflies, "#00ff0055");
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