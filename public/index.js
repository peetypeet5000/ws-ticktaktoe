//called when any button clicked
function buttonClicked(event) {
	//will get the value of the button, 0-8
	var buttonSelected = event.target.dataset.value;

	//if the square is not empty
	if(gameState.board[buttonSelected] != 0) {
		alert("Invalid Move!");
	} else {
		//set to players int, so 1 for player 1 and 2 for player 2
		gameState.board[buttonSelected] = gameState.activePlayer;
	}

	//advance to next turn
	if(gameState.activePlayer == 2) {
		gameState.activePlayer = 1;
	} else {
		gameState.activePlayer = 2;
	}

	console.log("== Move recorded. Current gameState: ", gameState);

	updateBoard();

	sendRequest();
}


//visually updates the board based on gameState
function updateBoard() {

	//grabs all the div's from the gameboard container
	var allBoxes = ticTac_board.querySelectorAll("div");

	//loop thru every box, update its visual style if it was played
	//its 0-18 because that query selection returns the box & image divs
	for(var i = 0; i < 18; i = i + 2) {
		var currentBox = allBoxes[i];

		//if 1, tick, if 2, tack
		if(gameState.board[i / 2] == 1){
			currentBox.classList.add("box-tick");
		} else if(gameState.board[i / 2] == 2) {
			currentBox.classList.add("box-tack");
		}
	}
}



//sends new gameState to server
function sendRequest() {
	console.log("== Sending Request");

	//makes gamedata into string
	var gameStateString = JSON.stringify(gameState);

	//actually send request
	webSocket.send(gameStateString);



}





//JSON object to hold active gamestate
var gameState = {
	activePlayer: 1,
	board: [
		0, 0, 0, 0, 0, 0, 0, 0, 0
	]
}

/******* Event Listeners **********/
var buttonsContainer = document.getElementById("ticTac_board");
buttonsContainer.addEventListener('click', buttonClicked, false);



/******* Start WebSocket *********/
var webSocket = new WebSocket('ws://localhost:3000');

//on webSocket Open
webSocket.onopen = function(event) {
	console.log("== webSocket is open now.");
  };

//if Websocket error, print it
webSocket.onerror = function(event) {
	console.log("== webSocket Error:" + event.data);
  };


//when a websocket message received, update gamestate
webSocket.onmessage = function(event) {
	var newGameState = JSON.parse(event.data);

	gameState = newGameState;

	console.log(" == New Server GameState Received: ", gameState);
	updateBoard();
}