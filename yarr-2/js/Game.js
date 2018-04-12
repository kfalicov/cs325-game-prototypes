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
            //sprite.tint = 0xaaffaa;
        }else if(currentPhase == "repair"){
            game.canvas.style.cursor = "pointer";
            sprite.tint = 0xaaffaa;
            graphics.lineStyle(2, 0x00ff00, 0.8);
            graphics.drawRect(sprite.left, sprite.top, sprite.width, sprite.height);
        }
        else{
            sprite.tint = 0xbbbbbb;
        }
    }

    function out(sprite){
        game.canvas.style.cursor = "default";
        rooms.forEach(function(member) {
            if(member.row != undefined){
                member.tint = 0xbbbbbb;
            }
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
                    if(member.row != undefined){
                        if(member.row == sprite.row) {
                            member.tint = 0xffffff;
                        }else{
                            member.tint = 0xbbbbbb;
                        }
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
                        if(member.cannon == 1 && member.alive){
                            attacksRemaining++;
                        }
                    }else{
                        if(member.row != undefined){
                            member.tint = 0xbbbbbb;
                        }
                    }
                }, this, true);
                text.setText("Player Phase:\nClick to attack the enemy!\nAttacks you'll get: "+attacksRemaining);
            }
        }
        else if(currentPhase == "repair" && !sprite.alive){
            sprite.alive = true;
            sprite.removeChildAt(sprite.children.length-1).destroy();
            sprite.tint = 0xbbbbbb;
            currentPhase = "enemyrepair";
            text.setStyle({ font: "25px Verdana", fill: "#440000", align: "center" });
            text.setText("Enemy Phase:\nRepair damage");
            var numberOfInjuries = 0;
            enemyrooms.forEach(function(member) {
                if(!member.alive){
                    numberOfInjuries++;
                }
            }, this, true);
            if(numberOfInjuries>0){
                game.time.events.add(Phaser.Timer.SECOND, function()
                {
                    var repaired = false;
                    while(!repaired){
                        var current = enemyrooms.getRandom();
                        if(!current.alive){
                            repaired = true;
                            current.alive = true;
                            current.removeChildAt(0);
                            current.tint = 0xffffff;
                        }
                    }
                    currentPhase = "choose";
                    text.setStyle({ font: "25px Verdana", fill: "#004400", align: "center" });
                    text.setText("Player Phase:\nChoose the ship deck you'll use!");
                }, this);
            }else{
                currentPhase = "choose";
                    text.setStyle({ font: "25px Verdana", fill: "#004400", align: "center" });
                    text.setText("Player Phase:\nChoose the ship deck you'll use!");
            }
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
                var disabledrooms = [0,0,0];
                enemyrooms.forEach(function(member){
                    if(!member.alive && member.row != undefined){
                        disabledrooms[member.row]++;
                    }
                }, this, true);
                if(disabledrooms.indexOf(3)!=disabledrooms.lastIndexOf(3)){
                    shared.winner = "player";
                    game.state.start('GameOver');
                }
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
                    if(member.row != undefined){
                        member.tint = 0xbbbbbb;
                    }
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
        attackPlayer(max);
    }

    function attackPlayer(attacksLeft){
        console.log("attacking");
        var targets = [];
        while(attacksLeft > 0){
            let target = rooms.getRandom();
            if(!targets.includes(target) && target.alive && target.row != undefined){
                targets.push(target);
                attacksLeft--;
            }
            console.log(attacksLeft);
        }
        target = game.add.image(enemyrooms.x+238,enemyrooms.y-50,'target');
        target.scale.setTo(0.08,0.08);
        target.tint = 0xff0000;
        target.alpha = 0;
        var anim = game.add.tween(target).to({alpha:1}, 300, Phaser.Easing.Quadratic.InOut, true);
        var tweens = [];
        for(var i=0;i<targets.length;i++){
            var tempTween = game.add.tween(target).to({x:targets[i].x+rooms.x, y:targets[i].y+rooms.y}, 500, Phaser.Easing.Quadratic.InOut);
            tweens.push(tempTween);
            tempTween.attacking = targets[i];
            tempTween.onComplete.add(function(tweenTarg, etc)
            {
                var img = game.add.image(12,15,'dead');
                img.scale.setTo(0.03,0.03);
                etc.attacking.addChild(img);
                //console.log(etc);
                etc.attacking.alive = false;
                var disabledrooms = [0,0,0];
                rooms.forEach(function(member){
                    if(!member.alive && member.row != undefined){
                        disabledrooms[member.row]++;
                    }
                }, this, true);
                if(disabledrooms.indexOf(3)!=disabledrooms.lastIndexOf(3)){
                    shared.winner = "computer";
                    game.state.start('GameOver');
                }
            },this);
            if(tweens[i-1] != undefined){
                tweens[i-1].chain(tempTween);
            }
            console.log(tweens);
        }
        if(tweens.length>0){
            tweens[0].start();
        }
        game.time.events.add(Phaser.Timer.SECOND, repairStage);
    }

    function repairStage(){
        enemygraphics.clear();
        var anim = game.add.tween(target).to({alpha:0}, 300, Phaser.Easing.Quadratic.InOut, true);
        anim.onComplete.add(function(){
            target.destroy();
        })
        console.log("repair");
        currentPhase = "repair";
        text.setStyle({ font: "25px Verdana", fill: "#004400", align: "center" });
        text.setText("Player Phase:\nRepair damage");
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
                //console.log("cannon placed at "+ current.col, current.row);
            }
        }
    }

    //this enables the click and drag to place objects from the inventory
    function build(sprite){
        //placeablearea = game.add.group();
        placetile = game.add.sprite(0,0,'room_build');
        placetile.alpha = 0.5;
        placetile.tint = 0xff1111;
        var clone = game.add.sprite(0,0,sprite.key, sprite.frame);
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
        placetile.alpha = 0.5;
        placetile.tint = 0xff1111;
        var clone = game.add.image(0,0,sprite.key);
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
            }
        });
        //figure.alpha = 0;
        placetile.x = sprite.centerX-sprite.centerX%76;
        placetile.y = sprite.centerY-sprite.centerY%76;
        //var canPlace = false;
        //console.log(placeablearea.length);
        var place = checkExists(placetile, rooms);
        if(place >0 && rooms.children[place].tint == 0xffff11){
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
        if(placetile.tint != 0xff1111){
            currentarea.addChild(sprite);
            //offset within cube because can have up to 3 items per cell
            /* for(var i=0;i<currentarea.children;i++){
                currentarea.children[i].x = 
            } */
            currentarea.inputEnabled=false;
            //sprite.bringToTop();
            //sprite.events.onDragStart.add(startMove);
            //console.log(sprite.parent);
        }else{
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
        if(placetile.tint != 0xff1111){
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
            figure.alpha = 1;
            updateAreas(sprite);
        }else{
            console.log("can't place");
            sprite.destroy();
        }
        //console.log(rooms);
        placetile.destroy();
        placeablearea.alpha = 0;
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

    var placetile;

    var target;
    var hoverRow = [];
    var activeRow = [];

    var rooms;
    var figure;
    var placeablearea;
    var currentarea;
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
            

            var backocean = game.add.sprite(game.world.centerX,game.height-220,'ocean');
            backocean.anchor.setTo(0.5,0);
            
            enemyrooms = game.add.group();
            var room;
            var x = 3;
            var y = 3;
            var spritewidth = 64, spriteheight = 64;
            //var ship = game.add.sprite(-49,-68, 'ship');
            var badship = game.add.sprite(-46,-68, 'badship');
            badship.anchor.setTo(1,0);
            badship.scale.x*=-1;
            
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
            
            //ship.name == "ship";

            enemyrooms.addChildAt(badship,0);
            enemyrooms.x = 515;
            enemyrooms.y = 150;

            //graphics = game.add.graphics(rooms.x,rooms.y);
            enemygraphics = game.add.graphics(enemyrooms.x,enemyrooms.y);
            var ocean = game.add.sprite(game.world.centerX,game.height-140,'ocean');
            ocean.anchor.setTo(0.5,0);
            let scale = game.width/ocean.width;
            ocean.scale.setTo(scale,scale);
            backocean.scale.setTo(scale,scale);
            backocean.scale.x*=-1;

            //var shiptween = game.add.tween(rooms).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var enemyshiptween = game.add.tween(enemyrooms).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);

            //var highlighttween = game.add.tween(graphics).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);
            var enemyhighlighttween = game.add.tween(enemygraphics).to({y:'-24'}, 4000, Phaser.Easing.Quadratic.InOut, true, 500, -1, true);

            var oceantween = game.add.tween(backocean).to({y:'-48'}, 4000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
            var oceantween = game.add.tween(ocean).to({y:'-38'}, 4000, Phaser.Easing.Quadratic.InOut, true, 100, -1, true);
        
            placeablearea = game.add.group();
            placetile = game.add.sprite(0,0,'room_build');
            placetile.alpha = 0;
            placeablearea.alpha = 0;

            var roombuy = game.add.sprite(200,10,'room_empty');
            roombuy.inputEnabled = true;
            roombuy.scale = {x:0.5,y:0.5};
            roombuy.events.onInputDown.add(build, this, 0, roombuy);

            var cannonbuy = game.add.sprite(248,10,'room_cannon');
            cannonbuy.inputEnabled = true;
            cannonbuy.scale = {x:0.5,y:0.5};
            cannonbuy.events.onInputDown.add(buy, this, 0, cannonbuy);

            var barrelbuy = game.add.sprite(296,10,'room_barrel');
            barrelbuy.inputEnabled = true;
            barrelbuy.scale = {x:0.5,y:0.5};
            barrelbuy.events.onInputDown.add(buy, this, 0, barrelbuy);

            var treasurebuy = game.add.sprite(344,10,'room_treasure');
            treasurebuy.inputEnabled = true;
            treasurebuy.scale = {x:0.5,y:0.5};
            treasurebuy.events.onInputDown.add(buy, this, 0, treasurebuy);

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

            var style = { font: "25px Verdana", fill: "#ffffff", fontWeight: "bold"};
            text = game.add.text( 50, 8, money, style );
            text.strokeThickness="6";
            var dollarsign = game.add.text(20, 4, "$", {font:"32px Verdana", fill:"#ffffaa", fontWeight: "bold"});
            dollarsign.strokeThickness = "6";
            //text.anchor.setTo( 0, 0.0 );
            text.lineSpacing = -10;
        },

        update: function () {
            money++;
            text.setText(money);
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