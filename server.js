//import modules and ata
var express = require('express');
var exphbs = require('express-handlebars');
var ws = require('ws');

//setup express
var app = express();
var port = 3000;

//setup websocket server
const webSocketServer = new ws.Server({ noServer: true });

//setup active gamestate
var gameState = {
  type: "gameState",
  activePiece: 1, //1 or 2
  currentPlayer: 1, //starts at 1
  board: [
      0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
}


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

  //when a new user connects, send them gamestate
  socket.send(JSON.stringify(gameState));

  //update list of players, assign player their #
  updatePlayerList(socket);


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
});



//adds all new clients to array of clients, sends client their spot in array
function updatePlayerList(socket) {
  currentPlayers.push(socket);
  console.log("== New Player Joined. Current Players: ", currentPlayers.length);

  var message = JSON.stringify({
    type: "assignPlayer",
    playerInt: currentPlayers.length,
  });

  socket.send(message);

}



//sends updated gamestate to ALL clients
function updateClients() {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
}


//DO ALL GAME LOGIC HERE
function updateGameState() {

  //advance gamestate to next player in queue
  gameState.currentPlayer++;
  if(gameState.currentPlayer > currentPlayers.length) {
    gameState.currentPlayer = 1;
  }

  //check if this player is still connected
  checkValidPlayer();

  //advance to next piece (tick or tack)
	if(gameState.activePiece == 2) {
		gameState.activePiece = 1;
	} else {
		gameState.activePiece = 2;
  }

  //REPLACE WITH REAL LOGIC -- currently just clears board if middle filled
  if(gameState.board[4] != 0) {
    console.log("== Resetting Game");
    gameState.board = [
      0, 0, 0, 0, 0, 0, 0, 0, 0
    ]
    console.log(gameState);
  }

}



//makes sure current player has not disconnected
function checkValidPlayer() {

  //console.log("cur play: ", gameState.currentPlayer, "ar: ", currentPlayers);
  if(currentPlayers[gameState.currentPlayer - 1].readyState !== ws.OPEN) {
    //advance to next player
    gameState.currentPlayer++;
    if(gameState.currentPlayer > currentPlayers.length) {
      gameState.currentPlayer = 1;
    }

    console.log("== Current Player Disconnected. Advancing to next player: ", gameState.currentPlayer);
    //check again
    checkValidPlayer();
  }

  //if not true, do nothing
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

