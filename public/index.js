//called when any button clicked
function buttonClicked(event) {
	//will get the value of the button, 0-8
	var buttonSelected = event.target.dataset.value;

	//if the square is not empty
	if(gameState.board[buttonSelected] != 0) {
		//if not a valid square to click, deny
		alert("Invalid Move!");
	} else if(player != gameState.currentPlayer) {
		//if it's not this client's turn, deny
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
  tellUser();
}



//sends new gameState to server
function sendRequest() {
	console.log("== Sending Move to Server");

	//makes gamedata into string
	var gameStateString = JSON.stringify(gameState);

	//actually send request
	webSocket.send(gameStateString);
}



//toggles the hidden class on the modal div
function showModal(){
  var modal = document.getElementById("ModalBackdrop");
	if(modal.classList[0] == "hidden") {
		modal.classList.remove("hidden");
	} else {
		console.log("What the H?");
	}
}

//adds the hidden class to modal div
function hideModal(){
  console.log("CLOSE SESAME");
  var modal = document.getElementById("ModalBackdrop");
	modal.classList.add("hidden");
  console.log("CLOSED SESAME");
}

document.getElementById("closer").addEventListener("click", hideModal);


//JSON object to hold active gamestate
var gameState = {
	type: "gameState",
	activePiece: 1,
	currentPlayer: 0,
	totalPlayers: 0,
	board: [
		0, 0, 0, 0, 0, 0, 0, 0, 0
	]
}

var player; //used to hold int signifying place in queue

/******* Event Listeners **********/
var buttonsContainer = document.getElementById("ticTac_board");
buttonsContainer.addEventListener('click', buttonClicked, false);



/******* Websocket Stuff *********/
var webSocket = new WebSocket('wss://raspi.peterlamontagne.com/tiktak');

//on webSocket Open
webSocket.onopen = function(event) {
	console.log("== webSocket is open now.");
};

//if Websocket error, print it
webSocket.onerror = function(event) {
	console.log("== webSocket Error:" + event.data);
};


//Handles the receviving of a message from the server
//Assumes all messages are JSON objects with known type keys
webSocket.onmessage = function(event) {

	//parse string into object, print to console
	var newMessage = JSON.parse(event.data);
	console.log("== New Server Message Received: ", newMessage);

	//depending on type of message, handle differently
	switch(newMessage.type) {
		case "gameState":
			//received new gamestate
			gameState = newMessage;
			updateBoard();
			break;
		case "assignPlayer":
			//server assinging this client place in queue
			player = newMessage.playerInt;
			console.log("== Player Order Assigned. I am: ", player);
			tellUser();
			break;
		case "gameOver":
			if(newMessage.state == 1) {
				console.log("== A win was recorded");
        showModal();
			} else {
				console.log("== A tie was recorded");
        showModal();
			}
			break;
	}

}

//Changes the text on the sidebar with player turn
function tellUser(){
  if (Math.abs(player - gameState.currentPlayer) == 0){
    var textBox = document.getElementById("navigation-label");
    textBox.innerHTML = "You're up!";
  }
  else{
    var textBox = document.getElementById("navigation-label");
    textBox.innerHTML = "<label for='nav-title-text' id='navigation-label'>You are currently <span id='player-number'></span> in line.</label>";
    var idNumber = document.getElementById("player-number");
    idNumber.innerHTML = Math.abs(player - gameState.currentPlayer);
  }
}
