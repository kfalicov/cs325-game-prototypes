"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    //let bouncy = null;
    let boidsAmount = 15;
    let shipSprite;
    let asteroids;
    let flock;
    let newboids = [];

    let score = 0;
    let scoretext;
    
    let startingEnemies = 3;
    let incrementEnemies = 1;
    let maxEnemies = 20;

    let minVelocity = 50;
    let maxVelocity = 150;
    let asteroidSpawnSize = 2;

    let initialDelay = Phaser.Timer.SECOND*8;
    let secondsBetweenEnemyMod = 1;
    let timer;

    let thrustSound;
    let hitSound;
    let bangSound;
    let lifeSound;

    var shipProperties = {
        startX: game.width * 0.5,
        startY: game.height * 0.5,
        acceleration: 300,
        drag: 50,
        angularDrag: 80,
        maxVelocity: 350,
        maxAngular: 200,
        angularVelocity: 0,
        angularAcceleration: 1000,
    };

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    

    function checkBoundaries(sprite) {
        if (sprite.right <  0) {
            sprite.x = game.width+sprite.width/2;
        } else if (sprite.left > game.width) {
            sprite.x = 0-sprite.width/2;
        } 
 
        if (sprite.bottom < 0) {
            sprite.y = game.height+sprite.height/2;
        } else if (sprite.top > game.height) {
            sprite.y = 0-sprite.height/2;
        }
    }
    
    function createAsteroid(tier){
        let asteroid = game.add.sprite(0,0,'asteroid');
        //chooses a starting point for the asteroid
        var side = Math.round(Math.random());
        var x;
        var y;
        
        if (side) {
            x = (Math.round(Math.random()) * (game.width+asteroid.width))-asteroid.width/2;
            y = Math.random() * game.height;
        } else {
            x = Math.random() * game.width;
            y = (Math.round(Math.random()) * (game.height+asteroid.height))-asteroid.height/2;
        }
        asteroid.data = {
            'size': tier,
            'health': tier*2,
            'maxhealth': tier*2,
        }
        asteroid.scale.setTo(tier,tier);
        asteroid.position.set(x,y);
        asteroid.anchor.setTo(0.5,0.5);
        asteroids.add(asteroid);
        asteroid.body.setCircle(asteroid.width/(tier*2));
        let randomAngle = game.math.degToRad(game.rnd.angle());
        let randomVelocity = game.rnd.integerInRange(minVelocity, maxVelocity);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);

    }

    function createChildAsteroid(tier, x, y){
        let asteroid = game.add.sprite(0,0,'asteroid');
        asteroid.data = {
            'size': tier,
            'health': tier*2,
            'maxhealth': tier*2,
        }
        asteroid.scale.setTo(tier,tier);
        asteroid.position.set(x,y);
        asteroid.anchor.setTo(0.5,0.5);
        asteroids.add(asteroid);
        asteroid.body.setCircle(asteroid.width/(tier*2));
        let randomAngle = game.math.degToRad(game.rnd.angle());
        let randomVelocity = game.rnd.integerInRange(minVelocity, maxVelocity);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);

    }
    //unnecessary check
function checklife(asteroid){
    //console.log(asteroid.exists);
    return true;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

    //  Called if an asteroid is hit by a boid
function collisionHandler (asteroid, boid) {
    if(asteroid.exists){
        asteroid.data.health--;
        var str = rgbToHex(255,Math.floor(255*(asteroid.data.health/asteroid.data.maxhealth)), Math.floor(255*(asteroid.data.health/asteroid.data.maxhealth)));
        var hex = parseInt(str.replace(/^#/, ''), 16);
        asteroid.tint = hex;
        boid.kill();
        hitSound.play();
        if(asteroid.data.health<=0){
            asteroid.kill();
            bangSound.play();
            score+=asteroid.data.size*100;
            scoretext.setText(score);
            if(asteroid.data.size>1){
                createChildAsteroid(asteroid.data.size-1, asteroid.position.x, asteroid.position.y);
                createChildAsteroid(asteroid.data.size-1, asteroid.position.x, asteroid.position.y);
            }
            else{
                console.log("new boid");
                for(var i=0;i<asteroidSpawnSize+2;i++){
                    let bird = new Boid(game, game.rnd.between(asteroid.position.x,asteroid.position.x+asteroid.width), game.rnd.between(asteroid.position.y,asteroid.position.y+asteroid.height), flock);
                    bird.target = shipSprite;
                    bird.scale.setTo(0.5,0.5);
                    flock.add(bird);
                    //bird.tint = 0xff0000;
                }
            }
        }
    }
}
function killPlayer(){
    shared.lastscore = score;
    game.sound.stopAll();
    game.state.start('GameOver');
}
    return {
        create: function () {
            game.sound.stopAll();
            this.initGraphics();
            this.initPhysics();
            this.initKeyboard();
            shipSprite.tint = 0x00ff00;
            flock = game.add.group();
            asteroids = game.add.group();
            asteroids.enableBody = true;
            asteroids.physicsBodyType = Phaser.Physics.ARCADE;
            for(var i=0;i<boidsAmount;i++){
                var bird = new Boid(game, game.world.randomX, game.world.randomY, flock);
                bird.target = shipSprite;
                flock.add(bird);
            }

            timer = game.time.create(false);
            timer.loop(initialDelay, function(){
                for(var i=0;i<incrementEnemies;i++){
                    createAsteroid(Math.floor(asteroidSpawnSize));
                }
                lifeSound.play();
                this.delay = initialDelay*secondsBetweenEnemyMod;
                secondsBetweenEnemyMod = Math.max(secondsBetweenEnemyMod-0.05, 0.5);
                //console.log(this.delay);
                asteroidSpawnSize += 0.125;
                //maxVelocity+=5;
                incrementEnemies = Math.min(8, incrementEnemies+0.2);
                //console.log(incrementEnemies);
                for(var i=0;i<asteroidSpawnSize;i++){
                    var bird = new Boid(game, game.rnd.between(shipSprite.position.x,shipSprite.position.x+shipSprite.width),game.rnd.between(shipSprite.position.y,shipSprite.position.y+shipSprite.height), flock);
                    bird.target = shipSprite;
                    bird.scale.setTo(0.5,0.5);
                    flock.add(bird);
                }
            }, this);
            timer.start();

            var style = { font: "25px Courier", fill: "#ffffff", align: "left" };
            scoretext = game.add.text(20, 20, score, style);

            //flock.setAll('target',shipSprite);
            flock.setAll('scale.x',0.5);
            flock.setAll('scale.y',0.5);

            //sound
            hitSound = game.sound.add('explode');
            bangSound = game.sound.add('break');
            thrustSound = game.sound.add('thrust');
           // thrustSound.loop = true;
            lifeSound = game.sound.add('newboid');
        },
    
        update: function () {
            game.physics.arcade.overlap(asteroids, flock, collisionHandler, checklife, this);
            game.physics.arcade.overlap(shipSprite, asteroids, killPlayer, null, this);
            this.checkPlayerInput();
            checkBoundaries(shipSprite);
            if(newboids !== undefined && newboids.length != 0){
                //var boid = newboids[0];
                flock.add(newboids[0]);
                flock.add(newboids[1]);
                newboids = [];
            }
            asteroids.forEachExists(function(member){
                checkBoundaries(member);
            });
        },

        render: function(){
            //game.debug.physicsGroup(asteroids);
        },

        initGraphics: function () {
            shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, 'boid');
            shipSprite.angle = -90;
            shipSprite.anchor.set(0.5, 0.5);
        },
        
        initPhysics: function () {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            
            game.physics.enable(shipSprite, Phaser.Physics.ARCADE);
            shipSprite.body.drag.set(shipProperties.drag);
            shipSprite.body.angularDrag = shipProperties.angularDrag;
            shipSprite.body.maxAngular = shipProperties.maxAngular;
            shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);
        },
        
        initKeyboard: function () {
            this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.key_thrust_2 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        },
        
        checkPlayerInput: function () {
            if (this.key_left.isDown) {
                shipSprite.body.angularAcceleration = -shipProperties.angularAcceleration;
            } else if (this.key_right.isDown) {
                shipSprite.body.angularAcceleration = shipProperties.angularAcceleration;
            } else {
                shipSprite.body.angularAcceleration = 0;
            }

            if (this.key_thrust.isDown || this.key_thrust_2.isDown) {
                if(!thrustSound.isPlaying){
                    thrustSound.play();
                }
                game.physics.arcade.accelerationFromRotation(shipSprite.rotation, shipProperties.acceleration, shipSprite.body.acceleration);
            } else {
                thrustSound.stop();
                shipSprite.body.acceleration.set(0);
            }
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
            var style = { font: "25px Courier", fill: "#ffffff", align: "left" };
            var scoretext = game.add.text(20, 20, shared.lastscore, style);
            game.input.onDown.add( function() {
                //game.state.add( 'Game', GameStates.makeGame( game, shared ) );
                game.state.start('MainMenu');
            }, this );
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            var text = game.add.text( game.world.centerX, game.world.centerY,
                "You died. \n Click to return to menu.",
                style );
            text.anchor.setTo( 0.5, 0.0 );
        },
    
        update: function () {
    
            //	Do some nice funky main menu effect here
            
        }
        
    };
};

var Boid = function(game, x, y, group, options) {
    Phaser.Sprite.call(this, game, x, y, 'boid');
    this.anchor.setTo(0.5, 0.5);
    this.group = group;
    this.game.physics.arcade.enableBody(this);
  
    this.options = options || {};
    this.cannibal = this.options.caniibal;
  
    
    this.maxVelocity = 350.0;
    this.maxForce = 30.0;
    this.seekForce = .5;
    
    this.radius = Math.sqrt(this.height * this.height + this.width * this.width) / 2;
  
    this.desiredSeparation = 50.0;
    this.maxDistance = this.radius * 15.0;
    
  };


Boid.prototype = Object.create(Phaser.Sprite.prototype);
Boid.prototype.constructor = Boid;

Boid.prototype.update = function() {
  this.body.acceleration.setTo(0,0);
  //console.log(this);
  if(this.target && this.target.exists) {
    var seekAccel = Phaser.Point();
    if(this.target instanceof Phaser.Group) {
      seekAccel = this.seekGroup();
    } else {
      seekAccel = this.seek(this.target.body.position);
    }
    seekAccel.multiply(this.seekForce, this.seekForce);
    this.applyForce(seekAccel);
  }
  this.applyForce(this.separate());
  this.applyForce(this.align());
  this.cohesion();
  
  this.checkBorders();
  this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
};

Boid.prototype.applyForce = function(force) {
  this.body.acceleration = Phaser.Point.add(this.body.acceleration, force);
};

Boid.prototype.seekGroup = function(targetGroup) {

  var closest = null;
  var distance = Number.MAX_VALUE;
  targetGroup = targetGroup || this.target;
  targetGroup.forEachExists(function(target) {
    var d = this.body.position.distance(target.body.position);
    if(d < distance) {
      distance = d;
      closest = target;
    }
  }, this);
  if(closest) {
    return this.seek(closest.body.position);  
  }
  return new Phaser.Point();
};

Boid.prototype.seek = function(target) {
  var desired = Phaser.Point.subtract(target, this.body.position);

  desired.normalize();
  desired.multiply(this.maxVelocity, this.maxVelocity);

  var steer = Phaser.Point.subtract(desired, this.body.velocity);
  steer.limit(this.maxVelocity);
  return steer;
};

Boid.prototype.lookAtClosest = function() {
    var target = null;
    var dist = 0;
    this.group.forEach(function(boid) {
      if (boid.body.position !== this.body.position) {
        var distBetween = this.game.physics.arcade.distanceBetween(this, boid);
        if(!target ||  distBetween < dist) {
          dist = distBetween;
          target = boid;
        }
      }
    },this);
  
    if(!!target) {
      this.rotation = this.game.physics.arcade.angleBetween(this, target);
    }
  };
  
  Boid.prototype.separate = function() {
    var distance = new Phaser.Point();
    var steer = new Phaser.Point();
    var count = 0;
  
    this.group.forEach(function(boid) {
      var d = this.body.position.distance(boid.body.position);
      if((d > 0) && (d < this.desiredSeparation)) {
        var diff = Phaser.Point.subtract(this.body.position, boid.body.position);
        diff.normalize();
        diff.divide(d,d);
        steer.add(diff.x,diff.y);
        count++
      }
    }, this);
  
    if(count > 0) {
      steer.divide(count, count);
    }
  
    if(steer.getMagnitude() > 0) {
      steer.normalize();
      steer.multiply(this.maxVelocity, this.maxVelocity);
      steer.subtract(this.body.velocity.x, this.body.velocity.y);
      steer.limit(this.maxForce);
    }
  
    return steer;
  };
  
  
  Boid.prototype.cohesion = function() {
    
    var sum = new Phaser.Point();
    var steer = new Phaser.Point();
    var count = 0;
  
    this.group.forEach(function(boid) {
      var d = this.body.position.distance(boid.body.position);
      if ((d > 0) && d < this.maxDistance) {
        sum.add(boid.body.position.x, boid.body.position.y);
        count++;
      }
    }, this);
  
    if (count > 0) {
      sum.divide(count, count);  
      return this.seek(sum);
    }
    return steer;
  };
  
  
  Boid.prototype.align = function() {
    var sum = new Phaser.Point();
    var steer = new Phaser.Point();
    var count = 0;
    this.group.forEach(function(boid) {
      var d = this.body.position.distance(boid.body.position);
      if ((d > 0) && d < this.maxDistance) {
        sum.add(boid.body.velocity.x, boid.body.velocity.y);
        count++;
      }
    }, this);
  
    if (count > 0) {
      sum.divide(count, count);  
  
      sum.normalize();
      sum.multiply(this.maxVelocity, this.maxVelocity);
      steer = Phaser.Point.subtract(sum, this.body.velocity);
      steer.limit(this.maxForce);
    }
  
    return steer;
  };
  
  Boid.prototype.checkBorders = function() {
    if(this.body.position.x < -this.radius ){
      this.body.position.x = this.game.width + this.radius;
    }
    if(this.body.position.y < -this.radius ){
      this.body.position.y = this.game.height + this.radius;
    }
    if(this.body.position.x > this.game.width + this.radius ){
      this.body.position.x = -this.radius;
    }
    if(this.body.position.y > this.game.height + this.radius ){
      this.body.position.y = -this.radius;
    }
  };