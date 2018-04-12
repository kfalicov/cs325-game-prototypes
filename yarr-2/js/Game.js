"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    let player;
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    function cloneGroup(group){
        var result = game.add.group();
        group.forEach(function(member){
            var clone = game.add.sprite(member.x, member.y, member.key, member.frame);
            result.add(clone);
        });
        return result;
    }

    //this enables the click and drag to place objects from the inventory
    function build(sprite){
        //placeablearea = game.add.group();
        placetile = game.add.sprite(0,0,'room_build');
        placetilelayer.add(placetile);
        placetile.alpha = 0.5;
        placetile.tint = 0xff1111;
        var clone = game.add.sprite(0,0,sprite.key, sprite.frame);
        clone.cost = sprite.cost;
        clone.adjacent = [-1,-1,-1,-1];
        clone.inputEnabled = true;
        clone.input.enableDrag(true);
        clone.events.onDragUpdate.add(onMove);
        clone.events.onDragStop.add(placeTile);
        clone.input.startDrag(this.input.activePointer);

    }

    //this enables the click and drag to place objects from the inventory
    function buy(sprite){
        //placeablearea = game.add.group();
        placetile = game.add.sprite(0,0,'room_build');
        placetilelayer.add(placetile);
        placetile.alpha = 0.5;
        placetile.tint = 0xff1111;
        var clone = game.add.image(0,0,sprite.key);
        clone.cost = sprite.cost;
        clone.inputEnabled = true;
        clone.input.enableDrag(true);
        clone.events.onDragUpdate.add(onMoveItem);
        clone.events.onDragStop.add(placeItem);
        clone.input.startDrag(this.input.activePointer);
    }

    //shows where the tile will be placed on release
    function onMove(sprite){
        placeablearea.alpha=1;
        figure.alpha = 0;
        placetile.x = sprite.centerX-sprite.centerX%76;
        placetile.y = sprite.centerY-sprite.centerY%76;
        //var canPlace = false;
        //console.log(placeablearea.length);
        var place = checkExists(placetile, placeablearea);
        if(place != -1){
            currentarea = placeablearea.children[place];
            placetile.tint = 0x11ff11;
        }else{
            placetile.tint = 0xff1111;
        }
    }

    //shows where the tile will be placed on release
    function onMoveItem(sprite){
        placetile.x = sprite.centerX-sprite.centerX%76;
        placetile.y = sprite.centerY-sprite.centerY%76;
        rooms.forEach(function(member){
            if(member.children.length <= 3 && member != rooms.children[0]){
                member.tint = 0xffff11;
                for(var i=0;i<member.children.length;i++){
                    member.children[i].tint = 0xffff11;
                }
            }
        });
        //figure.alpha = 0;
        placetile.x = sprite.centerX-sprite.centerX%76;
        placetile.y = sprite.centerY-sprite.centerY%76;
        //var canPlace = false;
        //console.log(placeablearea.length);
        var place = checkExists(placetile, rooms);
        if(place > 0 && rooms.children[place].tint == 0xffff11){
            currentarea = rooms.children[place];
            placetile.tint = 0x11ff11;
        }else{
            placetile.tint = 0xff1111;
        }
    }

    //snaps to the grid location
    function placeItem(sprite, pointer){
        //console.log("placing an item");
        sprite.x = 0;
        sprite.y = 0;
        var style = {font:"16px Verdana", fill:"#ffffff", align: "center", stroke: "#aa2222", strokeThickness: 3}
        var outputtext = game.add.text(pointer.x, pointer.y, "temp", style);
        var textrise = game.add.tween(outputtext).to({y:'-48', alpha: 0}, 2000, Phaser.Easing.Quadratic.Out, true);
        textrise.onComplete.add(function(){
            outputtext.destroy();
        });
        outputtext.anchor.setTo(0.5,1);
        
        if(placetile.tint != 0xff1111){
            if(money>=sprite.cost){
                money-=sprite.cost;
                text.setText(money);
                currentarea.addChild(sprite);
                //offset within cube because can have up to 3 items per cell
                /* for(var i=0;i<currentarea.children;i++){
                    currentarea.children[i].x = 
                } */
                currentarea.inputEnabled=false;
                //sprite.bringToTop();
                //sprite.events.onDragStart.add(startMove);
                //console.log(sprite.parent);
                outputtext.stroke="#22aa22";
                outputtext.setText("-"+sprite.cost);
            }else{
                outputtext.setText("can't afford");
                console.log("can't place");
                sprite.destroy();
            }
        }else{
            outputtext.setText("can't build here");
            console.log("can't place");
            currentarea = null;
            sprite.destroy();
        }
        //console.log(rooms);
        placetile.destroy();
        placeablearea.alpha = 0;
        //console.log(sprite.adjacent);
        rooms.forEach(function(member){
            if(member.occupant == undefined || member.occupant == null){
                member.tint = 0xffffff;
            }
            for(var i=0;i<member.children.length;i++){
                member.children[i].tint = 0xffffff;
            }
        });
    }

    //check if there's something already occupying a spot in that array
    function checkExists(member, group){
        //console.log(member);
        for(var i=0;i<group.length;i++){
            if(member.x == group.children[i].x && member.y == group.children[i].y){
                return i;
            }
        }
        return -1;
    }

    //checks for overlap without physics
    function checkOverlap(spriteA, spriteB){
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
    
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }

    function updateAreas(sprite){
        placeablearea.removeAll(true);
        var left = rooms.children[0].x;
        var bottom = rooms.children[0].y;
        rooms.forEach(function(member){
            for(var i=0;i<4;i++){
                if((i == 3 && member.x <= left)||(i==1 && member.x>=228+left)||(i == 0 && member.y <= bottom-228)||(i==2 && member.y>=bottom)){
                    continue;
                }
                if(member.adjacent[i] == -1){
                    var newx = member.x + directions[i].x*76;
                    var newy = member.y + directions[i].y*76;
                    var area = game.add.image(newx, newy, 'room_build');
                    area.tint = 0xffff11;
                    area.alpha = 0.5;
                    var place = checkExists({x: newx, y: newy}, placeablearea);
                    if(place == -1){
                        placeablearea.add(area);
                        area.adjacent = [-1,-1,-1,-1];
                        area.adjacent[(i+2)%4] = member;
                    }else{
                        area.destroy();
                        placeablearea.getAt(place).adjacent[(i+2)%4] = member;
                        //console.log("duplicate");
                    }
                    //console.log(placeablearea.length);
                    //console.log(newx, newy);
                }
            }
        });
        //console.log("number of placeable areas:", placeablearea.length);
    }

    function countInstances(list, item){
        var count = 0;
        //console.log(list);
        list.forEach(function(member){
            if(member == item){
                count++;
            }
        });
        //console.log(count);
        return count;
    }
    //make placeable areas highlighted, update placeablearea for removed tile
    function startMove(sprite, pointer){
        figure.alpha = 0;
        placetile = game.add.sprite(0,0,'room_build');
        placetilelayer.add(placetile);
        placetile.alpha = 0.5;
        placetile.tint = 0xff1111;
        //sprite.adjacent = [-1,-1,-1,-1];
        for(var i=0;i<4;i++){
            if(sprite.adjacent[i]!=-1){
                sprite.adjacent[i].adjacent[(i+2)%4] = -1;
                checkNeighbors(sprite.adjacent[i]);
            }
        }
        placeablearea.children.forEach(function(member){
            for(var i=0;i<4;i++){
                if(member.adjacent[i]==sprite){
                    member.adjacent[i]=-1;
                }
            }
        });
        game.add.existing(sprite);
        updateAreas(sprite);
        //console.log("number of placed rooms:", rooms.length);
    }

    function checkNeighbors(sprite){
        for(var i=0;i<4;i++){
            if(sprite.adjacent[i] != -1){
                if(countInstances(sprite.adjacent[i].adjacent, -1)+1 >= 4){
                    sprite.inputEnabled = false;
                    break;
                }else{
                    sprite.inputEnabled = true;
                }
            }
        }
    }

    //snaps to the grid location
    function placeTile(sprite, pointer){
        sprite.x = sprite.centerX-sprite.centerX%76;
        sprite.y = sprite.centerY-sprite.centerY%76;
        var style = {font:"16px Verdana", fill:"#ffffff", align: "center", stroke: "#aa2222", strokeThickness: 3}
        var outputtext = game.add.text(pointer.x, pointer.y, "temp", style);
        var textrise = game.add.tween(outputtext).to({y:'-48', alpha: 0}, 2000, Phaser.Easing.Quadratic.Out, true);
        textrise.onComplete.add(function(){
            outputtext.destroy();
        });
        outputtext.anchor.setTo(0.5,1);
        
        if(placetile.tint != 0xff1111){
            if(money>=sprite.cost){
                money-=sprite.cost;
                text.setText(money);
                sprite.adjacent = currentarea.adjacent;
                for(var i=0;i<4;i++){
                    if(sprite.adjacent[i] != -1){
                        sprite.adjacent[i].adjacent[(i+2)%4] = sprite;
                        checkNeighbors(sprite.adjacent[i]);
                    }
                }
                sprite.events.onDragStart.add(startMove);
                rooms.add(sprite);
                figure.position.setTo(getTopRightRoom().x+76, getTopRightRoom().y);
                updateAreas(sprite);
                outputtext.stroke="#22aa22";
                outputtext.setText("-"+sprite.cost);
            }else{
                outputtext.setText("can't afford");
                console.log("can't place");
                sprite.destroy();
            }
        }else{
            outputtext.setText("can't build here");
            console.log("can't place");
            //money+=sprite.cost;
            //text.setText(money);
            sprite.destroy();
        }
        //console.log(rooms);
        placetile.destroy();
        placeablearea.alpha = 0;
        figure.alpha = 1;
        //console.log(sprite.adjacent);
    }

    function getTopRightRoom(){
        var room = rooms.children[0];
        rooms.forEach(function(member){
            if(member.x>room.x){
                room = member;
            }else if(member.x == room.x && member.y<room.y){
                room = member;
            }
        });
        //console.log(top);
        return room;
    }

    function attack(){
        //console.log("attacked!");
        rooms.forEach(function(member){
            for(var i=0;i<member.children.length;i++){
                if(member.children[i].key == "room_cannon"){
                    //console.log("cannon found");
                    var cannonball = game.add.sprite(member.children[i].world.x+member.children[i].centerX, member.children[i].world.y+member.children[i].centerY, 'shot');
                    cannonball.anchor.setTo(0.5,0.5);
                    var randomsprite = enemyrooms.getRandom();
                    var targetx = randomsprite.world.x - randomsprite.width/2;
                    var targety = randomsprite.centerY;
                    var shottween1 = game.add.tween(cannonball).to({y:'-100'}, 300, Phaser.Easing.Quadratic.Out, false);
                    var shottween2 = game.add.tween(cannonball).to({y:targety}, 300, Phaser.Easing.Quadratic.In, false);
                    shottween1.chain(shottween2);
                    shottween1.start();
                    var shottween3 = game.add.tween(cannonball).to({x:targetx}, 630, "Linear", true, 0, 0, false);
                    shottween3.onComplete.add(function(){
                        cannonball.destroy();
                        randomsprite.health--;
                        var str = Phaser.Color.RGBtoString(0,Math.floor(255/maxhealth), Math.floor(255/maxhealth), 1, '#');
                        var hex = parseInt(str.replace(/^#/, ''), 16);
                        randomsprite.tint-= hex;
                        console.log(hex);
                        if(randomsprite.health <= 0){
                            //console.log("rekt");
                            randomsprite.destroy();
                            money+=200*iteration/2;
                            text.setText(money);
                            if(enemyrooms.children.length == 0){
                                iteration++;
                                console.log("ship destroyed");
                                enemyrooms = cloneGroup(rooms);
                                enemyrooms.pivot.setTo(1,0);
                                enemyrooms.scale.x *=-1;
                                enemyrooms.x = game.width;
                                maxhealth = 10*iteration/2;
                                enemyrooms.addAll('health', maxhealth);
                            }
                        }
                    })

                }
            }
        });
    }

    function drawWaves(){
        sinewave.clear();
        for (var i = 0; i < game.world.width; i++)
        {
            sinewave.rect(i, game.height, 2,sin[i]*siny-90, '#0d7dbbbb');
        }
        Phaser.ArrayUtils.rotateLeft(sin);
    }

    var iteration = 1;
    var maxhealth;

    var sinewave;
    var sin;
    var sinx=0;//the x as input for y
    var siny=0;//the function y=cos(x)
    var dx=0.01;//the strength of the current(higher is more wavy);

    var placetile;

    var target;
    var hoverRow = [];
    var activeRow = [];

    var rooms;
    var figure;
    var placeablearea;
    var currentarea;
    var placetilelayer;
    //compass directions and how they affect adjacency
    var directions = [{x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}];

    var enemyrooms;

    var graphics;
    var enemygraphics;

    var currentPhase = "choose";
    var attacksRemaining = 0;

    let activeLeft;
    let activeRight;
    let activeTop;
    var text;
    var money = 200;
    return {
        
        create: function () {
            //set world background
            let bg = game.add.sprite(0,0,'gameBG');
            bg.anchor.setTo(0.5, 0.64);
            bg.x = game.world.centerX;
            bg.y = game.world.centerY;
            //player = game.add.sprite(0,0);
        
            placeablearea = game.add.group();
            placetile = game.add.sprite(0,0,'room_build');
            placetile.alpha = 0;
            placeablearea.alpha = 0;

            var roombuy = game.add.sprite(200,10,'room_empty');
            roombuy.inputEnabled = true;
            roombuy.scale = {x:0.5,y:0.5};
            roombuy.cost = 500;
            roombuy.events.onInputDown.add(build, this, 0, roombuy);

            var cannonbuy = game.add.sprite(248,10,'room_cannon');
            cannonbuy.inputEnabled = true;
            cannonbuy.scale = {x:0.5,y:0.5};
            cannonbuy.cost = 100;
            cannonbuy.events.onInputDown.add(buy, this, 0, cannonbuy);

            var barrelbuy = game.add.sprite(296,10,'room_barrel');
            barrelbuy.inputEnabled = true;
            barrelbuy.scale = {x:0.5,y:0.5};
            barrelbuy.cost = 50;
            barrelbuy.events.onInputDown.add(buy, this, 0, barrelbuy);

            var treasurebuy = game.add.sprite(344,10,'room_treasure');
            treasurebuy.inputEnabled = true;
            treasurebuy.scale = {x:0.5,y:0.5};
            treasurebuy.cost = 150;
            treasurebuy.events.onInputDown.add(buy, this, 0, treasurebuy);

            var shopicons = game.add.group();
            shopicons.addMultiple([roombuy,cannonbuy,barrelbuy,treasurebuy]);
            shopicons.forEach(function(member){
                var price = game.add.text(member.centerX, member.bottom, "$"+member.cost, {font:"12px Verdana", fill:"#ffbb00", fontWeight:"bold"});
                price.anchor.setTo(0.5,0);
            });

            rooms = game.add.group();
            var firstroom = game.add.sprite(100,400,'room_rudder');
            firstroom.x = firstroom.centerX-firstroom.centerX%76;
            firstroom.y = firstroom.centerY-firstroom.centerY%76;
            var secondroom = game.add.sprite(firstroom.x, firstroom.y-76, 'room_empty');
            var thirdroom = game.add.sprite(secondroom.x+76, secondroom.y, 'room_empty');
            var fourthroom = game.add.sprite(firstroom.x+76, firstroom.y, 'room_empty');
            firstroom.adjacent = [secondroom,fourthroom,-1,-1];
            secondroom.adjacent = [-1,thirdroom,firstroom,-1];
            thirdroom.adjacent = [-1,-1,fourthroom,secondroom];
            fourthroom.adjacent = [thirdroom,-1,-1,firstroom];
            secondroom.inputEnabled = true;
            secondroom.input.enableDrag(true);
            secondroom.events.onDragStart.add(startMove);
            secondroom.events.onDragUpdate.add(onMove);
            secondroom.events.onDragStop.add(placeTile);
            rooms.add(firstroom);
            rooms.add(secondroom);
            rooms.add(thirdroom);
            rooms.add(fourthroom);
            //rooms.alpha =0.5;
            figure = game.add.sprite(getTopRightRoom().x+76, getTopRightRoom().y, 'room_figure');
            updateAreas(firstroom);

            enemyrooms = cloneGroup(rooms);
            enemyrooms.pivot.setTo(1,0);
            enemyrooms.scale.x *=-1;
            enemyrooms.x = game.width;
            maxhealth = 10;
            enemyrooms.addAll('health', maxhealth);

            placetilelayer = game.add.group();
            placetilelayer.add(placetile);
            var oceantween = game.add.tween(rooms).to({y:'-18'}, 3500, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(placeablearea).to({y:'-18'}, 3500, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(figure).to({y:'-18'}, 3500, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(placetilelayer).to({y:'-18'}, 3500, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);

            sinewave = game.add.bitmapData(game.world.width,600);
            sinewave.addToWorld();
            //generate a sin with variable amplitude for the sin(the amplitude is cosine dependent)
            var data = game.math.sinCosGenerator(game.world.width, 15, 1, 2);//length, sinAmplitude, cosAmplitude, frequency)
            sin = data.sin;

            var style = { font: "25px Verdana", fill: "#ffffff", fontWeight: "bold"};
            text = game.add.text( 50, 8, money, style );
            text.strokeThickness="6";
            var dollarsign = game.add.text(20, 4, "$", {font:"32px Verdana", fill:"#ffffaa", fontWeight: "bold"});
            dollarsign.strokeThickness = "6";
            //text.anchor.setTo( 0, 0.0 );
            text.lineSpacing = -10;
            game.time.events.loop(Phaser.Timer.SECOND, attack, this);
        },

        update: function () {

            sinx+=dx;
            siny= Math.cos(sinx);
            drawWaves();
            /* if(this.input.activePointer.targetObject !== null){
                if(this.input.activePointer.targetObject.isDragged == true){
                    var currentSprite= this.input.activePointer.targetObject.sprite;
                    onMove(currentSprite);
                }
            } */
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
    
            let bg = game.add.sprite(0,0,'gameBG');
            bg.anchor.setTo(0.5, 0.64);
            bg.x = game.world.centerX;
            bg.y = game.world.centerY;
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
            var style = { font: "72px Verdana", fill: "#000000", align: "center" };
            var text = game.add.text( game.world.centerX, game.world.centerY,
                "",
                style );
                if(shared.winner == "player"){
                    text.setText("Congratulations!\nYou sunk the enemy!");
                }else{
                    text.setText("Oh No!\nYou're sunk!");
                }
            text.anchor.setTo( 0.5, 0.5 );
        },
    
        update: function () {
    
            //	Do some nice funky main menu effect here
            
        }
        
    };
};