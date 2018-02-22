"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
    var preloadBar = null;

	var ready = false;

    return {
    
        preload: function () {
    
            //	These are the assets we loaded in Boot.js
            //	A nice sparkly background and a loading progress bar
            background = game.add.sprite(0, 0, 'preloaderBackground');
            preloadBar = game.add.sprite( game.width/2, game.height*2/3, 'preloaderBar');
            background.x += (game.width-background.width)/2;
            preloadBar.x -= preloadBar.width/2;

    
            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.
            game.load.setPreloadSprite(preloadBar);
    
            //	Here we load the rest of the assets our game needs.
            //	As this is just a Project Template I've not provided these assets, swap them for your own.
            game.load.image('titlePage', 'assets/menu_bg.png');
            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
            game.load.atlas('sprites', 'assets/sprites.png', 'assets/sprites.json');
            game.load.image('butterfly1', 'assets/butterfly1.png');
            game.load.image('butterfly2', 'assets/butterfly2.png');
            game.load.image('butterfly3', 'assets/butterfly3.png');
            //game.load.audio('titleMusic', ['assets/Poppers and Prosecco.mp3']);
            //	+ lots of other required assets here
        },
    
        create: function () {
    
            //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
            preloadBar.cropEnabled = false;
    
        },
    
        update: function () {
    
            //	You don't actually need to do this, but I find it gives a much smoother game experience.
            //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
            //	You can jump right into the menu if you want and still play the music, but you'll have a few
            //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
            //	it's best to wait for it to decode here first, then carry on.
            
            //	If you don't have any music in your game then put the game.state.start line into the create function and delete
            //	the update function completely.
            
           /*  if (game.cache.isSoundDecoded('titleMusic') && ready == false)
            {
                ready = true;
                game.state.start('MainMenu');
            } */
            ready = true;
            game.state.start('MainMenu');
        }
    
    };
};
