
// A simple engine for making 2D javascript games. Everyone is a box.

var boxEngine = {

	// variables
	canvas: document.getElementById("canvas"),
	ctx : canvas.getContext("2d"),
	msgconsole : document.getElementById("console"),

	current_input : "none",

	GAME_SPEED : 5, // ms paused between loops

	BACKGROUND_COLOUR : "#000000", // boring awful colour scheme
	SCORE_COLOUR : "#ffffff",
	ENEMY_COLOUR : "#ffff00",
	BORDER_COLOUR : "#D3D3D3",
	PLAYER_COLOUR : "#ffffff",
	PAUSE_MENU_COLOUR : "#D3D3D3",
	PAUSE_TEXT_COLOUR : "#000000",


	MENU_FONT : "20px Arial",

	isPaused : false,

	enemiesArray : [], //array of enemies on the map
	bordersArray : [], //array of screen borders (they're just long motionless enemies)

	// enemy and player objects

	Enemy: function(x_pos, y_pos, width, height) {
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.width = width;
		this.height = height;	// all hitboxes are rectangular
		this.speed = 1;

		boxEngine.enemiesArray.push(this); // put it in the list

		this.destroy = function() {
			var myindex = boxEngine.enemiesArray.indexOf(this);
			boxEngine.enemiesArray.splice(myindex,1); // remove this enemy from the list
		}

		this.goLeft = function() {
			this.x_pos = this.x_pos - this.speed;
		}
		this.goRight = function() {
			this.x_pos = this.x_pos + this.speed;
		}
		this.goUp = function() {
			this.y_pos = this.y_pos - this.speed;
		}
		this.goDown = function() {
			this.y_pos = this.y_pos + this.speed;
		}
		this.takeTurn = function() {
			return;	// default enemy AI is to do nothing
		}
	},

	Player: function(x_pos, y_pos, width, height) {
		// todo: combine the commonalities in enemy/player classes
		this.x_pos = x_pos;
		this.y_pos = y_pos;
		this.width = width;
		this.height = height;

		this.score = 0;
		this.speed = 1;

		this.goLeft = function() {
			this.x_pos = this.x_pos - this.speed;
		}
		this.goRight = function() {
			this.x_pos = this.x_pos + this.speed;
		}
		this.goUp = function() {
			this.y_pos = this.y_pos - this.speed;
		}
		this.goDown = function() {
			this.y_pos = this.y_pos + this.speed;
		}
	},

	// default AI patterns

	roamAI: function() {
		// ai that handles very simple roaming around

		// move in a random direction or stay still
		randint = Math.floor((Math.random()*10)+1); // generate random integer between 1 and 10
		if (randint < 3) {
				this.goLeft();
			} else if (randint < 5) {
				this.goUp();
			} else if (randint < 7 ) {
				this.goDown();
			} else if (randint < 9){
				this.goRight();
			} else {
				return;
			}

		//destroy if offscreen
		var c;
		for (c in boxEngine.bordersArray) {
			border = boxEngine.bordersArray[c];
			if (boxEngine.hasCollided(this, border)) {
				this.destroy();
				return;
			}
		}
	},

	// collision handling

	hasCollided: function(player, enemy) {
		// checks if two objects (modeled as boxes) are overlapping
		// check for conditions under which they can't collide
		if ((enemy.x_pos > player.x_pos+player.width) || (enemy.x_pos+enemy.width < player.x_pos) || (enemy.y_pos > player.y_pos+player.height) || (enemy.y_pos+enemy.height < player.y_pos)) {
			return false;
		}
		return true;
	},

	// input handling

	handleKeys: function(key) {
		switch (key.keyCode) {
			case 37:
				//left
				boxEngine.current_input = "left";
				break;
			case 38:
				//up
				boxEngine.current_input = "up";
				break;
			case 39:
				//right
				boxEngine.current_input = "right";
				break;
			case 40:
				//down
				boxEngine.current_input = "down";
				break;
			case 32:
				//space bar
				boxEngine.switchPaused();
				break;

		}

	},
	clearKeys: function(){
		// make sure inputs don't persist after keyup
		boxEngine.current_input = "none";
	},

	handleDefaultMovement: function(player) {
		// moves player in two dimensions based on current_input
		switch (boxEngine.current_input) {
				case "left":
					player.goLeft();
					break;
				case "right":
					player.goRight();
					break;
				case "up":
					player.goUp();
					break;
				case "down":
					player.goDown();
					break;
				}
	},

	// functions which handle setup and resetting

	placeBorders: function(size) {
		//top
		top_border = new boxEngine.Enemy(0,0,this.canvas.width,size);
		left_border = new boxEngine.Enemy(0,0,size,this.canvas.height);
		right_border = new boxEngine.Enemy(this.canvas.width-size,0,size,this.canvas.height);
		bottom_border = new boxEngine.Enemy(0, this.canvas.height-size,this.canvas.width,size);

		top_border.colour = this.BORDER_COLOUR;
		left_border.colour = this.BORDER_COLOUR;
		right_border.colour = this.BORDER_COLOUR;
		bottom_border.colour = this.BORDER_COLOUR;

		this.bordersArray.push(top_border);
		this.bordersArray.push(left_border);
		this.bordersArray.push(right_border);
		this.bordersArray.push(bottom_border);
	},


	clearEnemies: function() {
		boxEngine.enemiesArray = [];
	},


	// console display functions

	msgClear: function() {
		this.msgconsole.innerHTML = "";
	},
	msgPrint: function(msg) {
		this.msgconsole.innerHTML = "<h3>" + msg + "</h3>";
	},

	// canvas drawing functions

	drawIntro: function() {
		// clear canvas
		this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

		// draw background
		this.ctx.fillStyle = this.BACKGROUND_COLOUR; //black
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height)	
	},

	drawGame: function() {
		// clear canvas
		this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

		// draw background
		this.ctx.fillStyle = this.BACKGROUND_COLOUR; //black
		this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height)

		// draw score
		this.ctx.fillStyle = this.SCORE_COLOUR; //white
		this.ctx.font = this.MENU_FONT;
		this.ctx.fillText(String(player.score), this.canvas.width-50, 30);

		// draw enemies
		this.ctx.fillStyle = this.ENEMY_COLOUR; //white
		var c;
		for (c in this.enemiesArray) {
			enemy = this.enemiesArray[c];
			if ('colour' in enemy) {
				this.ctx.fillStyle = enemy.colour;
				this.ctx.fillRect(enemy.x_pos, enemy.y_pos, enemy.width, enemy.height);
				this.ctx.fillStyle = this.ENEMY_COLOUR;
			} else {
			this.ctx.fillRect(enemy.x_pos, enemy.y_pos, enemy.width, enemy.height);
		}
		}

		//draw player
		this.ctx.fillStyle = this.PLAYER_COLOUR; //black
		this.ctx.fillRect(player.x_pos,player.y_pos,player.width, player.height);
	},

	drawPauseMenu: function() {
		var menu_width = 350;
		var menu_height = 50;
		var width_margin = (this.canvas.width-menu_width)/2;
		var height_margin = (this.canvas.height-menu_height)/4;
		this.ctx.fillStyle = this.PAUSE_MENU_COLOUR;
		this.ctx.fillRect(width_margin, height_margin ,menu_width, menu_height);
		this.ctx.fillStyle = this.PAUSE_TEXT_COLOUR; //black
		this.ctx.font = this.MENU_FONT;
		this.ctx.fillText("Press SPACE to continue", width_margin + 60, height_margin + 30)
	},

	// main loop logic

	switchPaused: function(){
		if (!this.isPaused){
			this.isPaused = true;
			//draw paused stuff
			this.drawPauseMenu();
		} else {
			this.isPaused = false;
			//clear paused stuff
			this.msgClear();
			this.drawGame();
		}
	}

}


