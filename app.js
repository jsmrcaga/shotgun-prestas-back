// dependecies and options

var express = require('express');
var app = express();

var config = require('./config.js');

var chalk = require('chalk');

var db = require('./db.js');

var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// open connection to database
db.init();

// routing

// events
	//get
app.get("/events", function (req, res, err){

});

app.get("/events/:id", function (req, res, err){

});

app.get("/events/:id/prestas", function (req, res, err){

});

	//post
app.post("/event", function (req, res, err){

});

// prestas
	//get
app.get("/presta/all", function (req, res, err){

});

app.get("/presta/:id", function (req, res, err){
	
});

	//post
app.post("/presta", function (req, res, err) {
	
});

//shotgun
app.get("/presta/:id/shotguns", function (req, res, err){

});

app.post("/presta/:id/shotgun", function (req, res, err){

});


// startup

app.listen(80, function(){
	console.log(chalk.green("Server Up And Listening!"));
});

