"use strict";

window.onload = function() {

	//	Create your Phaser game and inject it into the "game" div.
	//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
	var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

	//	Add the States your game has.
	//	You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
	
	// An object for shared variables, so that them main menu can show
	// the high score if you want.
	var shared = {};
	
	game.state.add( 'Boot', GameStates.makeBoot( game ) );
	game.state.add( 'Preloader', GameStates.makePreloader( game ) );
	game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
	game.state.add( 'Game', GameStates.makeGame( game, shared ) );

	//	Now start the Boot state.
	game.state.start('Boot');
};

var adjective = ["Dirty","Mild","Wild","Crazy","Fast","Quick","Red","Bad","Mad","Old","Waco","Saddle","Boots","Spurs","Buffalo","Mexico","Scary","Horse","Axe","Western","Arizona","Colorado","Rocky"];
var title = ["Doc","Miner","Sheriff","Banker","Rancher","Cowboy","Kid","Farmer","Murderer","Bandit","Outlaw","Engineer","Inventor","Chicken","President","Mayor","Bartender","Soldier","Indian","Tanner","Missus","Mistress","Master","Poor Man"];
var firstname = ["Charlie","Rich","LeBron","Harry","Clint","McGraw","Sam","Wylde","Wyatt","Buford","Woody","Buchanan","Gene","Bart","Billy","Butch","John","George","Nat","Clyde"];
var lastname = ["Harding","Love","King","Earp","James","Eastwood","McGraw","Hill","Brown","Weston","Barnes","Goodman","Woodson","Harrison","Johnson","Oldman","Washington"];
var format = ["$f \"$a\"|$n $l", "$f $l|$n", "$f|$n The $a|$n $t", "$a|$t $f|$l", "$f \"The $t\" $l"];

/*
* global functions used for random name generation
*/
function generateName() {
	let string = format[Math.floor(Math.random() * format.length)];
	let result = removeOr(string);
	result = removeOr(result);
	result = removeOr(result);
	result = stringFill(result);
	return result;
}

function removeOr(string){
	let result;
	if(Math.random() < 0.5){
		result = string.replace(/(\"\$.\"|\$.)\|/, '');
	}
	else{
		result = string.replace(/\|\$./, '');
	}
	return result;
}

function stringFill(string){
	let result = string.replace("$a", randElement(adjective));
	result = result.replace(/\$n ?/g,'');
	result = result.replace("$t", randElement(title));
	result = result.replace("$f", randElement(firstname));
	result = result.replace("$l", randElement(lastname));
	return result;
}

function randElement(item){
	return item[Math.floor(Math.random() * item.length)];
}
