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
  activePlayer: 1,
  board: [
      0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
}

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

  socket.on('message', message => {
    //this is where websocket requests are actually handled
    console.log("== Client Message Recived: ", message)
    var objRecevied = JSON.parse(message);
    gameState = objRecevied; //overwright previous gamestate

    updateClients();
  })
});


//sends updated gamestate to ALL clients
function updateClients() {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
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

