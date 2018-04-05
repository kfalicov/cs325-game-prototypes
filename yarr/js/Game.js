"use strict";

GameStates.PlayerTurn = function( game, shared ) {
    // Create your own variables.
    let player;
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    function over(sprite){
        if(currentPhase == "attack"){
            var left = sprite.left;
            var right = sprite.right;
            rooms.forEach(function(member) {
                if(member.row == sprite.row) {
                    if(member.alive){
                        member.tint = 0xffffff;
                    }
                    if(member.left < left){
                        left = member.left;
                    }
                    if(member.right > right){
                        right = member.right;
                    }
                    hoverRow.push(member);
                }
            }, this, true);
            graphics.lineStyle(2, 0xFF0000, 0.8);
            graphics.drawRect(left, sprite.top, right-left, sprite.height);
            sprite.tint = 0xaaffaa;
        }else if(currentPhase == "repair"){
            sprite.tint = 0xaaffaa;
        }
    }

    function out(sprite){
        rooms.forEach(function(member) {
                member.tint = 0xbbbbbb;
        }, this, true);
        hoverRow = [];
        graphics.clear();
    }

    function click(sprite){
        graphics.clear();
        if(currentPhase == "attack"){
            if(activeRow.includes(sprite)){
                console.log("active row clicked");
                activeRow = [];
                rooms.forEach(function(member) {
                    if(member.row == sprite.row) {
                        member.tint = 0xffffff;
                    }else{
                        member.tint = 0xbbbbbb;
                    }
                }, this, true);
                sprite.tint = 0xaaffaa;
                
            }else{
                activeRow = hoverRow;
                activeTop = sprite.top;
                activeLeft = sprite.left;
                activeRight = sprite.right;
                rooms.forEach(function(member) {
                    if(member.row == sprite.row) {
                        if(member.left < activeLeft){
                            activeLeft = member.left;
                        }
                        if(member.right > activeRight){
                            activeRight = member.right;
                        }
                    }else{
                        member.tint = 0xbbbbbb;
                    }
                }, this, true);
            }
        }
        else if(currentPhase == "repair" && !sprite.alive){
            sprite.alive = true;
        }
    }

    var hoverRow = [];
    var activeRow = [];
    var rooms;
    var graphics;
    var currentPhase = "attack";
    let activeLeft;
    let activeRight;
    let activeTop;
    return {
        
        create: function () {
            //set world background
            let bg = game.add.sprite(0,0,'gameBG');
            bg.anchor.setTo(0.5, 0.64);
            bg.x = game.world.centerX;
            bg.y = game.world.centerY;
            //player = game.add.sprite(0,0);
            

            var backocean = game.add.sprite(game.world.centerX,game.height-220,'ocean');
            backocean.anchor.setTo(0.5,0);
            rooms = game.add.group();
            var room;
            var x = 3;
            var y = 3;
            var spritewidth = 64, spriteheight = 64;
            for(var i = 0; i < x; i++){
                for(var j = 0; j < y; j++){
                    room = rooms.create(0, 0, 'room');
                    room.row = i;
                    room.col = j;
                    room.tint = 0xbbbbbb;
                    room.inputEnabled = true;
                    room.events.onInputOver.add(over, this);
                    room.events.onInputOut.add(out, this);
                    room.events.onInputUp.add(click, this);
                    room.alive = true;
                }
            }
           // rooms.createMultiple(9, 'rooms', ['inside_undamaged'], true);
            rooms.align(3, -1, room.width, room.height);
            rooms.x = 100;
            rooms.y = 150;
            graphics = game.add.graphics(rooms.x,rooms.y);
            var ocean = game.add.sprite(game.world.centerX,game.height-180,'ocean');
            ocean.anchor.setTo(0.5,0);
            let scale = game.width/ocean.width;
            ocean.scale.setTo(scale,scale);
            backocean.scale.setTo(scale,scale);
            backocean.scale.x*=-1;
            var shiptween = game.add.tween(rooms).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var highlighttween = game.add.tween(graphics).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var oceantween = game.add.tween(backocean).to({y:'-48'}, 4000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(ocean).to({y:'-38'}, 4000, Phaser.Easing.Quadratic.InOut, true, 100, -1, true);
        },

        update: function () {
            rooms.forEach(function(member) {
                if(!member.alive){
                    member.tint = 0x111111;
                }
            }, this, true);
            if(activeRow !== undefined && activeRow.length != 0){
                //graphics.clear();
                graphics.lineStyle(5, 0xFFFFFF, 0.8);
                var sprite = activeRow[0];
                graphics.drawRect(activeLeft, activeTop, activeRight-activeLeft, 96);
            }
            console.log(activeRow);
        },

        render: function () {
            //game.debug.spriteBounds( player, 'rgba(255,255,0,0.4)' ) ;
            //game.debug.body(player);
            //game.debug.physicsGroup(hittableObjects);
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