//import modules and ata
var express = require('express');
var exphbs = require('express-handlebars');

//setup express
var app = express();
var port = process.env.PORT || 3000;

//setup active gamestate
var gameStates = {
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



app.post('/move', function(req, res, next) {
  console.log("== Current Gamestate: ", req.body, "\n");

  if(req.body && req.body.activePlayer && req.body.board) {
    res.status(200).send("Move recorded");
  }
})


app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
