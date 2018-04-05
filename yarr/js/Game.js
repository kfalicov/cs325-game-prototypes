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
        if(currentPhase == "choose"){
            game.canvas.style.cursor = "pointer";
            //console.log(currentPhase);
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
            game.canvas.style.cursor = "pointer";
            sprite.tint = 0xaaffaa;
        }
    }

    function out(sprite){
        game.canvas.style.cursor = "default";
        rooms.forEach(function(member) {
                member.tint = 0xbbbbbb;
        }, this, true);
        hoverRow = [];
        graphics.clear();
    }

    function click(sprite){
        graphics.clear();
        if(currentPhase == "choose"){
            if(activeRow.includes(sprite)){
                //console.log("active row clicked");
                activeRow = [];
                rooms.forEach(function(member) {
                    if(member.row == sprite.row) {
                        member.tint = 0xffffff;
                    }else{
                        member.tint = 0xbbbbbb;
                    }
                }, this, true);
                sprite.tint = 0xaaffaa;
                text.setText("Player Phase:\nChoose the ship deck you'll use!");
            }else{
                attacksRemaining = 0;
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
                        if(member.cannon == 1){
                            attacksRemaining++;
                        }
                    }else{
                        member.tint = 0xbbbbbb;
                    }
                }, this, true);
                text.setText("Player Phase:\nClick to attack the enemy!\nAttacks you'll get: "+attacksRemaining);
            }
        }
        else if(currentPhase == "repair" && !sprite.alive){
            sprite.alive = true;
        }
    }

    function enemyover(sprite){
        if((activeRow !== undefined && activeRow.length != 0)){
            game.canvas.style.cursor = "pointer";
        }
    }

    function enemyout(sprite){
            game.canvas.style.cursor = "default";
    }

    function enemyclick(sprite){
        if(currentPhase == "attack" || (activeRow !== undefined && activeRow.length != 0)){
            currentPhase = "attack";
            if(sprite.alive && attacksRemaining > 0){
                sprite.alive = false;
                var img = game.add.image(12,15,'dead');
                img.scale.setTo(0.03,0.03);
                sprite.addChild(img);
                attacksRemaining--;
                text.setText("Player Phase:\nClick to attack the enemy!\nAttacks remaining: "+attacksRemaining);
            }
            if(attacksRemaining == 0){
                activeRow = [];
                graphics.clear();
                rooms.forEach(function(member) {
                    member.tint = 0xbbbbbb;
                }, this, true);
                currentPhase == "enemyattack";
                game.canvas.style.cursor = "default";
                text.setStyle({ font: "25px Verdana", fill: "#440000", align: "center" });
                text.setText("Enemy Phase:\nChoosing Floor");
                game.time.events.add(Phaser.Timer.SECOND, enemyFloor, this);
            }
        }
    }

    function enemyFloor(){
        let rowtotals = [0,0,0];
        enemyrooms.forEach(function(member) {
            let cannonCount = 0;
            if(member.row != undefined && member.alive)
                rowtotals[member.row] += member.cannon;
        }, this, true);
        let max = rowtotals[0];
        let maxindex = 0;
        for(var i = 1; i<rowtotals.length; i++){
            if(rowtotals[i]>max){
                maxindex = i;
                max = rowtotals[i];
            }
        }
        var Left = Number.MAX_SAFE_INTEGER;
        var Right = Number.MIN_SAFE_INTEGER;
        var Top
        enemyrooms.forEach(function(member) {
            if(member.row == maxindex){
                Top = member.top;
                if(member.left < Left){
                    Left = member.left;
                }
                if(member.right > Right){
                    Right = member.right;
                }
            }
        }, this, true);
        enemygraphics.lineStyle(5, 0xFFFFFF, 0.8);
        enemygraphics.drawRect(Left, Top, Right-Left, 96);
        text.setText("Enemy Phase:\nAttacking");
        attackPlayer();
    }

    function attackPlayer(){
        console.log("attacking");
    }

    function placeCannons(ship){
        let numberOfCannons = 4;
        let cannonsPlaced = 0;
        while(cannonsPlaced < numberOfCannons){
            let current = ship.getRandom();
            if(current.cannon == 0){
                current.cannon = 1;
                cannonsPlaced++;
                var img = game.add.image(10,32,'cannon');
                img.scale.setTo(0.08,0.08);
                current.addChild(img);
            }
        }
    }

    function placeEnemyCannons(ship){
        let numberOfCannons = 4;
        let cannonsPlaced = 0;
        while(cannonsPlaced < numberOfCannons){
            let current = ship.getRandom();
            if(current.cannon == 0){
                current.cannon = 1;
                cannonsPlaced++;
                console.log("cannon placed at "+ current.col, current.row);
            }
        }
    }

    var hoverRow = [];
    var activeRow = [];

    var rooms;
    var enemyrooms;

    var graphics;
    var enemygraphics;

    var currentPhase = "choose";
    var attacksRemaining = 0;

    let activeLeft;
    let activeRight;
    let activeTop;
    var text;
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
            enemyrooms = game.add.group();
            var room;
            var x = 3;
            var y = 3;
            var spritewidth = 64, spriteheight = 64;
            var ship = game.add.sprite(-49,-68, 'ship');
            var badship = game.add.sprite(-46,-68, 'badship');
            badship.anchor.setTo(1,0);
            badship.scale.x*=-1;
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
                    room.cannon = 0;
                }
            }
            placeCannons(rooms);
            var enemyroom;
            for(var i = 0; i < x; i++){
                for(var j = 0; j < y; j++){
                    enemyroom = enemyrooms.create(0, 0, 'hiddenroom');
                    enemyroom.row = i;
                    enemyroom.col = j;
                    enemyroom.tint = 0xffffff;
                    enemyroom.inputEnabled = true;
                    enemyroom.events.onInputOver.add(enemyover, this);
                    enemyroom.events.onInputOut.add(enemyout, this);
                    enemyroom.events.onInputUp.add(enemyclick, this);
                    enemyroom.alive = true;
                    enemyroom.cannon = 0;
                }
            }
            placeEnemyCannons(enemyrooms);
            rooms.align(3, -1, room.width, room.height);
            rooms.addChildAt(ship,0);
            ship.name == "ship";
            rooms.x = 100;
            rooms.y = 150;

            enemyrooms.align(3, -1, room.width, room.height);
            enemyrooms.addChildAt(badship,0);
            enemyrooms.x = 515;
            enemyrooms.y = 150;

            graphics = game.add.graphics(rooms.x,rooms.y);
            enemygraphics = game.add.graphics(enemyrooms.x,enemyrooms.y);
            var ocean = game.add.sprite(game.world.centerX,game.height-140,'ocean');
            ocean.anchor.setTo(0.5,0);
            let scale = game.width/ocean.width;
            ocean.scale.setTo(scale,scale);
            backocean.scale.setTo(scale,scale);
            backocean.scale.x*=-1;

            var shiptween = game.add.tween(rooms).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var enemyshiptween = game.add.tween(enemyrooms).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);

            var highlighttween = game.add.tween(graphics).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var enemyhighlighttween = game.add.tween(enemygraphics).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);

            var oceantween = game.add.tween(backocean).to({y:'-48'}, 4000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(ocean).to({y:'-38'}, 4000, Phaser.Easing.Quadratic.InOut, true, 100, -1, true);
        
            var style = { font: "25px Verdana", fill: "#004400", align: "center" };
            text = game.add.text( game.world.centerX, 10,
                "Player Phase:\nChoose the ship deck you'll use!", style );
            text.anchor.setTo( 0.5, 0.0 );
            text.lineSpacing = -10;
        },

        update: function () {
            rooms.forEach(function(member) {
                if(!member.alive){
                    member.tint = 0x111111;
                }
            }, this, true);
            enemyrooms.forEach(function(member) {
                if(!member.alive){
                    member.tint = 0xaaaaaa;
                }else{
                    member.tint = 0xffffff;
                }
            }, this, true);
            if(activeRow !== undefined && activeRow.length != 0){
                //graphics.clear();
                graphics.lineStyle(5, 0xFFFFFF, 0.8);
                var sprite = activeRow[0];
                graphics.drawRect(activeLeft, activeTop, activeRight-activeLeft, 96);
            }
            //console.log(activeRow);
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