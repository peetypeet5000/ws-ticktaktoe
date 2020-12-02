//import modules and ata
var express = require('express');
var exphbs = require('express-handlebars');

//setup express
var app = express();
var port = process.env.PORT || 3000;

//setup templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


app.use(express.static('public'));


//serve the main page
app.get('/', function (req, res) {
  res.status(200).render('mainPage');
});


//404 page
app.get('*', function (req, res) {
  res.status(404).render('404', {
    url: req.url
  });
});




app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
