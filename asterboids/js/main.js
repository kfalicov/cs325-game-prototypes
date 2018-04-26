"use strict";

window.onload = function() {

	//	Create your Phaser game and inject it into the "game" div.
	//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
	let aspectratio=16/9;
	let smartwidth = 900;
	let smartheight = smartwidth/aspectratio;
	var game = new Phaser.Game(smartwidth, smartheight, Phaser.AUTO, 'game' );

	//	Add the States your game has.
	//	You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
	
	// An object for shared variables, so that them main menu can show
	// the high score if you want.
	var shared = {
		highscore: 0,
		lastscore: 0
	};
	
	//generateName();

	game.state.add( 'Boot', GameStates.makeBoot( game ) );
	game.state.add( 'Preloader', GameStates.makePreloader( game ) );
	game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
	game.state.add( 'Game', GameStates.makeGame( game, shared ) );
	game.state.add( 'GameOver', GameStates.makeGameOver( game, shared ) );

	//	Now start the Boot state.
	game.state.start('Boot');
};

//a helper function to get items from lists
function randElement(item){
	return item[Math.floor(Math.random() * item.length)];
}
