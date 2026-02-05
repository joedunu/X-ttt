// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
io = require('socket.io')(server);

util = require("util");							// Utility resources (logging, object inspection, etc)

var Leaderboard = require('./Leaderboard');		// Leaderboard module

/**************************************************
** GAME VARIABLES
**************************************************/
Player = require("./Player").Player;			// Player class
players = [];									// Array of connected players
players_avail = [];

// Routing
app.use(express.static(__dirname + '/public'));

// CORS middleware for API routes
app.use('/api', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

// API: Get leaderboard
app.get('/api/leaderboard', function(req, res) {
	var limit = parseInt(req.query.limit, 10) || 10;
	var topPlayers = Leaderboard.getTopPlayers(limit);
	res.json(topPlayers);
});

var port = process.env.PORT || 3001;

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});


require('./XtttGame.js');

io.on('connection', set_game_sock_handlers);
