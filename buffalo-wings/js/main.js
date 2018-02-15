"use strict";

window.onload = function() {

	//	Create your Phaser game and inject it into the "game" div.
	//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
	let aspectratio=16/9;
	let smartwidth = (window.innerWidth * window.devicePixelRatio)-17;
	let smartheight = smartwidth/aspectratio;
	var game = new Phaser.Game(smartwidth, smartheight, Phaser.AUTO, 'game' );

	//	Add the States your game has.
	//	You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
	
	// An object for shared variables, so that them main menu can show
	// the high score if you want.
	var shared = {};
	
	//generateName();

	game.state.add( 'Boot', GameStates.makeBoot( game ) );
	game.state.add( 'Preloader', GameStates.makePreloader( game ) );
	game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
	game.state.add( 'Game', GameStates.makeGame( game, shared ) );

	//	Now start the Boot state.
	game.state.start('Boot');
};

var adjective = ["Dirty","Mild","Wild","Crazy","Fast","Quick","Red","Bad","Mad","Old","Buffalo","Waco","Scary","Western","Gold","Rocky","Greasy","Mean","Drunk"];
var nickname = ["Railway","Locomotive","Potato","Wagon","Steel","Saddle","Boots","Mexico","Horse","Axe","Arizona","Colorado","Spurs","Whiskey","Chicken","Saloon","Shotgun","Revolver","Bullet","Cow","Dog"];
var title = ["Doc","Miner","Sheriff","Banker","Rancher","Cowboy","Kid","Farmer","Murderer","Bandit","Outlaw","Chicken","Mayor","Bartender","Blacksmith","Indian","Drunkard","Doctor","Beggar"];
var firstname = ["Charlie","Warren","Owen","LeBron","Harry","Clint","McGraw","Sam","Wylde","Wyatt","Buford","Woody","Buchanan","Gene","Billy","Butch","John","George","Nat","Clyde"];
var lastname = ["Wilder","Harding","Love","Wilson","King","Earp","James","Eastwood","McGraw","Hill","Brown","Weston","Barnes","Goodman","Woodson","Harrison","Johnson","Oldman","Washington"];
var format = ["$a ($f|$l)", "$f( $l|$n)", "$f $l", "$f the ($a |$n)$t", "\"$g\" ($f|$l)", "$f \"(The $t|$a)\" $l", "$f \"($a |$n)$g\" $l"];

/*
* global functions used for random name generation
*/
function generateName() {
	let string = randElement(format);
	let result = removeOr(string);
	let count = 0;
	while(result.includes("|") && count<5){
		result=removeOr(result);
		count++;
	}
	//console.log("count = "+count);
	result = stringFill(result);
	return result;
}

//goes through the string and removes each set of parentheses at a time. designed to be run multiple times to handle multiple or statements in a string.
function removeOr(string){
	let result;
	if(Math.random() < 0.5){
		result = string.replace(/\(.{0,6}\|/, '');
		result = result.replace(/\)/, '');
	}
	else{
		result = string.replace(/\|.{0,6}\)/, '');
		result = result.replace(/\(/, '');
	}
	//console.log(result);
	return result;
}

//replaces set strings with data
function stringFill(string){
	let result = string.replace(/\$n/g,'');
	result = result.replace("$a", randElement(adjective));
	result = result.replace("$t", randElement(title));
	result = result.replace("$f", randElement(firstname));
	result = result.replace("$l", randElement(lastname));
	result = result.replace("$g", randElement(nickname));
	return result;
}

//a helper function to get items from lists
function randElement(item){
	return item[Math.floor(Math.random() * item.length)];
}
