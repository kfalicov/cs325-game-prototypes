"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
	var playButton = null;
    
    function resize(){
        //game.scale.refresh();
        titlebg.x = (game.width-titlebg.width)/2;
        playButton.x = game.width/2 - playButton.width/2;
        playButton.y = game.height*2/3;
        //console.log("window resized to " + game.width);
    }

    function startGame(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        //music.stop();

        //	And start the actual game
        game.state.start('Game');

    }
    
    return {
    
        create: function () {
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            //music = game.add.audio('titleMusic');
            //music.play();
    
            let titlebg = game.add.sprite(0, 0, 'titlePage');
            titlebg.x += (game.width-titlebg.width)/2;
            console.log(game.width);
            playButton = game.add.button( game.width/2, game.height*2/3, 'playButton', startGame, null, 'over', 'out', 'down');
            playButton.x -= playButton.width/2;

            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            var text = game.add.text( game.world.centerX, 15,
                "Your high score: "+ shared.highscore,
                style );
            text.anchor.setTo( 0.5, 0.0 );
        },
    
        update: function () {
    
            //	Do some nice funky main menu effect here
    
        }
        
    };
};
