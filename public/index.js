//called when any button clicked
function buttonClicked(event) {
	//will get the value of the button, 0-8
	var buttonSelected = event.target.dataset.value;


	//if the square is not empty
	if(gameState.board[buttonSelected] != 0) {
		alert("Invalid Move!");
	} else if(player != gameState.currentPlayer) {
		alert("It's not your turn!");
	} else {
		//set to players int, so 1 for player 1 and 2 for player 2
		gameState.board[buttonSelected] = gameState.activePiece;
		//tell server we made a move
		sendRequest();
	}


}


//visually updates the board based on gameState
function updateBoard() {
	console.log("== Updating Game Board");

	//grabs all the div's from the gameboard container
	var allBoxes = ticTac_board.querySelectorAll("div");

	//loop thru every box, update its visual style if it was played
	//its 0-18 because that query selection returns the box & image divs
	for(var i = 0; i < 18; i = i + 2) {
		var currentBox = allBoxes[i];

		//if 1, tick, if 2, tack
		if(gameState.board[i / 2] == 1){
			currentBox.classList.add("box-tick");
		}
		 else if(gameState.board[i / 2] == 2) {
			currentBox.classList.add("box-tack");
		} 
		else if(gameState.board[i / 2] == 0) {
			//if its supposed to be blank, remove
			if(currentBox.classList[1] == "box-tack") {
				currentBox.classList.remove("box-tack");
			} 
			else if(currentBox.classList[1] == "box-tick") {
				currentBox.classList.remove("box-tick");
			}
		}
	}
}



//sends new gameState to server
function sendRequest() {
	console.log("== Sending Move to Server");

	//makes gamedata into string
	var gameStateString = JSON.stringify(gameState);

	//actually send request
	webSocket.send(gameStateString);



}





//JSON object to hold active gamestate
var gameState = {
	type: "gameState",
	activePiece: 1,
	currentPlayer: 0,
	board: [
		0, 0, 0, 0, 0, 0, 0, 0, 0
	]
}

var player;


/******* Event Listeners **********/
var buttonsContainer = document.getElementById("ticTac_board");
buttonsContainer.addEventListener('click', buttonClicked, false);



function showModal(){
  var modal = document.getElementById("Modal");
  modal.classList.remove("hidden");
}



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
	var message = JSON.parse(event.data);
	console.log("== New Server Message Received: ", message);

	switch(message.type) {
		case "gameState":
			gameState = message;
			updateBoard();
			
			break;
		case "assignPlayer":
			player = message.playerInt;
			console.log("== Player Order Assigned. I am: ", player);
			break;
	}
	
}
