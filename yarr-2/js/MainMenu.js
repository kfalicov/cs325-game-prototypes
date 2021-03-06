"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
    let playButton = null;
    let titlebg = null;
    let text;
    
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
        //game.state.add( 'Game', GameStates.Battle( game, shared ) );
        game.state.start('Game');

    }
    
    return {
    
        create: function () {
    
            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)
    
            //music = game.add.audio('titleMusic');
            //music.play();
    
            titlebg = game.add.sprite(0, 0, 'titlePage');
            var title = game.add.sprite(game.world.centerX, game.world.centerY-200, 'title');
            title.anchor.setTo(0.5,0);
            titlebg.scale.setTo(0.5,0.5);
            titlebg.x = (game.width-titlebg.width)/2;
            playButton = game.add.button( 0, 0, 'playButton', startGame, null, 'over', 'out', 'down');
            playButton.x -= playButton.width/2;

            titlebg.x = (game.width-titlebg.width)/2;
            playButton.x = game.width/2 - playButton.width/2;
            playButton.y = game.height*4/5;

            //game.scale.setResizeCallback(resize, this);
           // game.scale.onSizeChange.add(resize, this);
            
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.world.centerX, game.world.centerY+15,
                "A Piratey Battle Game",
                style );
                text.stroke = '#000000';
                text.strokeThickness = 6;
            text.anchor.setTo( 0.5, 0.0 );
        },
    
        update: function () {
            //	Do some nice funky main menu effect here

            //update on resize

        }
        
    };
};
