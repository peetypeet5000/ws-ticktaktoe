//import modules and ata
var express = require('express');
var exphbs = require('express-handlebars');
var ws = require('ws');

//setup express
var app = express();
var port = 3001;

//setup websocket server
const webSocketServer = new ws.Server({ noServer: true });

//setup active gamestate
var gameState = {
	type: "gameState",
	activePiece: 1, //1 or 2 -- determines tick or tack
	currentPlayer: 1, //starts at 1 -- used for player queue
	totalPlayers: 0,
	board: [
		0, 0, 0, 0, 0, 0, 0, 0, 0
	]
  }


//will hold the soocket objects for connected websocket clients
var currentPlayers = [];

//setup templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//stores received json in req.body
app.use(express.json());

//serves static files in /public
app.use(express.static('public'));


//serve the main page
app.get('/', function (req, res) {
	res.status(200).render('mainPage', {
		title: "Three n' a row!"
	});
});


//404 page
app.get('*', function (req, res) {
	res.status(404).render('404', {
		url: req.url,
		title: '404 - Page not found'
	});
});




//handle websocket request
webSocketServer.on('connection', socket => {

	//update list of players, assign new player their #
	currentPlayers.push(socket); //add to array
	console.log("== New Player Joined. Current Players: ", currentPlayers.length);
  
	//when a new user connects, send them gamestate
	//socket.send(JSON.stringify(gameState));
	updatePlayerNumbers();
	updateClients();
  
  
  
	//this is where websocket requests are actually handled
	socket.on('message', message => {
  
	  //print message, convert to JSON object
	  console.log("== Client Message Recived: ", message)
	  var objRecevied = JSON.parse(message)
  
	  //checks the type key in JSON object
	  switch(objRecevied.type) {
		case "gameState":
		  //if we get a new gamestate, overwrite and sync clients
		  gameState = objRecevied;
		  updateGameState();
		  updateClients();
		  break;
	  }
  
	})
  
	socket.on('close', message => { 
	  //updates array of players
  
	  console.log("= Player Disconnecting: ", currentPlayers.length);
	  //filters our dead socket
	  var newCurrentPlayers = currentPlayers.filter(function (ele) {
		if(ele.readyState == 1) {
		  return ele;
		}
	  })
  
	  currentPlayers = newCurrentPlayers;
  
	  console.log("= Player Disconnected. There is now ", currentPlayers.length, " players.");
  
	  //update clients
	  updatePlayerNumbers();

	  //force reset if no one left
	  if(currentPlayers.length == 0) {
		gameState = {
			type: "gameState",
			activePiece: 1, //1 or 2 -- determines tick or tack
			currentPlayer: 1, //starts at 1 -- used for player queue
			totalPlayers: 0,
			board: [
				0, 0, 0, 0, 0, 0, 0, 0, 0
			]
		  }
	  }
	
	})
  });





//sends updated gamestate to ALL clients
function updateClients() {
	//loops thru all connected clients
	webSocketServer.clients.forEach(function each(client) {
		if (client.readyState === ws.OPEN) {
			//send JSON of gameState object
			client.send(JSON.stringify(gameState));
		}
	});
}


/*****************************
 * This function does the actual game logic. This
 * includes advancing the player in the queue, advancing
 * the piece to be played, and checking for wins
 ******************************/
function updateGameState() {

  //advance gamestate to next player in queue
  gameState.currentPlayer++;
  if(gameState.currentPlayer >= (currentPlayers.length + 1)) {
    gameState.currentPlayer = 1;
  }

  //check if this player is still connected
  //checkValidPlayer();

  //advance to next piece (tick or tack)
  if(gameState.activePiece == 2) {
	gameState.activePiece = 1;
  } else {
	gameState.activePiece = 2;
  }

  //update total number of players
  gameState.totalPlayers = currentPlayers.length;

	//if win or tie, reset board
	if(checkWin() == true || checkTie() == true) {
		console.log("== A Win or a Tie was Recorded! Resetting...");
		if(checkWin() == true) {
			sendWinTie(1);
		} else {
			sendWinTie(2);
		}
		gameState.board = [
			0, 0, 0, 0, 0, 0, 0, 0, 0,
		]
	}
}



//sends a gameOver object to clients, 1 for win 2 for tie
function sendWinTie(winOrLoss) {
	webSocketServer.clients.forEach(function each(client) {
	  //only open clients
	  if (client.readyState === ws.OPEN) {
  
		  //the JSON object to send to new client
		  var gameOver = {
			type: "gameOver",
			state: winOrLoss,
		  };
  
		  //send JSON of gameOver object
		  client.send(JSON.stringify(gameOver));
	  }
	});
}


//loops thru all connected players and assigns them their number in the queue
function updatePlayerNumbers() {
	var playerNumber = 1;
  
	webSocketServer.clients.forEach(function each(client) {
	  //only open clients
	  if (client.readyState === ws.OPEN) {
  
		  //the JSON object to send to new client
		  var newPlayer = {
			type: "assignPlayer",
			playerInt: playerNumber,
		  };
  
  
		  //send JSON of gameState object
		  client.send(JSON.stringify(newPlayer));
  
		  playerNumber++;
	  }
	});
}




//checks for a win
function checkWin() {
	// Is there a more elegant way to do this?  Definitely
	// Do I know how to do it?  Yup!
	// Do I have the mental energy to implement the more elegant solution at this point in the term?
	// Nope.
	if ((gameState.board[0] == gameState.board [1]) && (gameState.board[1] == gameState.board[2]) && (gameState.board[1] != 0)) //check row 1 MUDA
		return true; // ORA
	else if ((gameState.board[3] == gameState.board[4]) && (gameState.board[4] == gameState.board[5]) && (gameState.board[4] != 0)) // check row 2 MUDA
		return true; // ORA
	else if ((gameState.board[6] == gameState.board[7]) && (gameState.board[7] == gameState.board[8]) && (gameState.board[7] != 0)) // check row 3 MUDA
		return true; // ORA
	else if ((gameState.board[0] == gameState.board[3]) && (gameState.board[3] == gameState.board[6]) && (gameState.board[3] != 0)) // check column 1 MUDA
		return true; // ORA
	else if ((gameState.board[1] == gameState.board[4]) && (gameState.board[4] == gameState.board[7]) && (gameState.board[4] != 0)) // Check column 2 MUDA
		return true; // ORA
	else if ((gameState.board[2] == gameState.board[5]) && (gameState.board[5] == gameState.board[8]) && (gameState.board[5] != 0)) // Check column 3 MUDA
		return true; // ORA
	else if ((gameState.board[0] == gameState.board[4]) && (gameState.board[4] == gameState.board[8]) && (gameState.board[4] != 0)) // Check diagonal 1 MUDA
		return true; // ORA
	else if ((gameState.board[2] == gameState.board[4]) && (gameState.board[4] == gameState.board[6]) && (gameState.board[4] != 0)) // Check diagonal 2 MUDA
		return true; // ORA
	else {
		return false; // WRRRRRRRRRRRRRRRRRRRRRRRRRRRRY
	}
}



//checks for a tie
function checkTie() {
	for (i = 0; i <= 9; i++) // Cycles through the board array
	{
		if (gameState.board[i] == 0) // If we find a blank spot

		return false; // There's no tie
	}
	return true; // We've cycled through the board, there are no empty spaces, game is a tie.
}


//start the server
const server = app.listen(port, function () {
	console.log("== Server is listening on port", port);
});


//upgrade the server (allows both http & ws on same server)
server.on('upgrade', (request, socket, head) => {
	webSocketServer.handleUpgrade(request, socket, head, socket => {
		webSocketServer.emit('connection', socket, request);
	});
});
