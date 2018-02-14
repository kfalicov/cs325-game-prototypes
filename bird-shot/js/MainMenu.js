"use strict";

MyGame.MainMenu = function() {

	var music = null;
	var playButton = null;
    
    function startGame() {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        //music.stop();

        //	And start the actual game
        this.scene.start('Play');

    }
    
    return {
    
        create: function () {
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            //music = game.add.audio('titleMusic');
            //music.play();
    
            this.add.sprite(400, 300, 'titlePage');
            playButton = this.add.sprite( 400, 400, 'playButton');
            playButton.setInteractive();
            playButton.on('pointerdown', startGame, this);
    
        },
    
        update: function () {
    
            //	Do some nice funky main menu effect here
    
        }
        
    };
};
