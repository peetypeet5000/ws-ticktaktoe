//called when any button clicked
function buttonClicked(event) {
    //will get the value of the button, 0-8
    var buttonSelected = event.target.dataset.value;

    //if the square is not empty
    if(gameState.board[buttonSelected] != 0) {
        alert("Invalid Move!");
        console.log("invalid move. Current gameState", gameState);
        return;
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
    var request = new XMLHttpRequest();
    var gameStateString = JSON.stringify(gameState);

    //specifies POST method on /move
    request.open('POST', '/move');

    //let server know its a JSON request
    request.setRequestHeader(
        'Content-Type', 'application/json'
    );

    //will get called once the responce is sent back
    request.addEventListener('load', function (event) {
        console.log(event.target.status);
        console.log("== Server Responce: ", event.target.response);
    });

    //actually send request
    request.send(gameStateString);

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


function showModal(){
  var modal = document.getElementById("Modal");
  modal.classList.remove("hidden");
}
