
var Leaderboard = require('./Leaderboard');

// Winning combinations
var WIN_SETS = [
	['c1', 'c2', 'c3'],
	['c4', 'c5', 'c6'],
	['c7', 'c8', 'c9'],
	['c1', 'c4', 'c7'],
	['c2', 'c5', 'c8'],
	['c3', 'c6', 'c9'],
	['c1', 'c5', 'c9'],
	['c3', 'c5', 'c7']
];

// Active games storage: { gameId: { board: {}, players: [p1, p2], currentTurn: 'm' or 's' } }
var activeGames = {};
var gameIdCounter = 0;

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// New player has joined
function onNewPlayer(data) {

	util.log("New player has joined: "+data.name);

	// Create a new player
	var newPlayer = new Player(-1, data.name, "looking");
	newPlayer.sockid = this.id;
	newPlayer.odid = data.odid || null; // Persistent user ID

	this.player = newPlayer;

	// Add new player to the players array
	players.push(newPlayer);
	players_avail.push(newPlayer);

	// util.log("looking for pair - uid:"+newPlayer.uid + " ("+newPlayer.name + ")");

	pair_avail_players();

	// updAdmin("looking for pair - uid:"+p.uid + " ("+p.name + ")");

	// updAdmin("new player connected - uid:"+data.uid + " - "+data.name);

};

// ----	--------------------------------------------	--------------------------------------------	

function pair_avail_players() {

	if (players_avail.length < 2)
		return;


	var p1 = players_avail.shift();
	var p2 = players_avail.shift();

	p1.mode = 'm';
	p2.mode = 's';
	p1.status = 'paired';
	p2.status = 'paired';
	p1.opp = p2;
	p2.opp = p1;

	// Create a new game session
	var gameId = ++gameIdCounter;
	p1.gameId = gameId;
	p2.gameId = gameId;
	activeGames[gameId] = {
		board: {},
		players: { m: p1, s: p2 },
		currentTurn: 'm',
		finished: false
	};

	//util.log("connect_new_players p1: "+util.inspect(p1, { showHidden: true, depth: 3, colors: true }));

	// io.sockets.connected[p1.sockid].emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m'});
	// io.sockets.connected[p2.sockid].emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s'});
	io.to(p1.sockid).emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m', gameId: gameId});
	io.to(p2.sockid).emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s', gameId: gameId});

	util.log("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");
	// updAdmin("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");

};

// ----	--------------------------------------------	--------------------------------------------	

function onTurn(data) {
	//util.log("onGameLoadedS with qgid: "+data.qgid);

	var player = this.player;
	var gameId = player.gameId;
	var game = activeGames[gameId];

	if (!game || game.finished) {
		util.log("Invalid turn: game not found or finished");
		return;
	}

	// Update board state
	var mark = player.mode === 'm' ? 'x' : 'o';
	game.board[data.cell_id] = mark;

	// Relay turn to opponent
	io.to(player.opp.sockid).emit("opp_turn", {cell_id: data.cell_id});

	util.log("turn  --  usr:"+player.mode + " - :"+player.name + "  --  cell_id:"+data.cell_id);

	// Check for win or draw
	var result = checkGameResult(game.board);

	if (result.finished) {
		game.finished = true;

		var p1 = game.players.m;
		var p2 = game.players.s;

		if (result.winner) {
			// Determine winner/loser based on mark
			var winner = result.winner === 'x' ? p1 : p2;
			var loser = result.winner === 'x' ? p2 : p1;

			// Record results
			if (winner.odid) Leaderboard.recordResult(winner.odid, winner.name, 'win');
			if (loser.odid) Leaderboard.recordResult(loser.odid, loser.name, 'loss');

			// Emit game result to both players
			io.to(winner.sockid).emit("game_result", { outcome: 'win', winSet: result.winSet });
			io.to(loser.sockid).emit("game_result", { outcome: 'loss', winSet: result.winSet });

			util.log("Game " + gameId + " finished: " + winner.name + " wins");
		} else {
			// Draw
			if (p1.odid) Leaderboard.recordResult(p1.odid, p1.name, 'draw');
			if (p2.odid) Leaderboard.recordResult(p2.odid, p2.name, 'draw');

			io.to(p1.sockid).emit("game_result", { outcome: 'draw' });
			io.to(p2.sockid).emit("game_result", { outcome: 'draw' });

			util.log("Game " + gameId + " finished: Draw");
		}

		// Clean up game
		delete activeGames[gameId];
	}
};

// Check if game has ended
function checkGameResult(board) {
	var result = { finished: false, winner: null, winSet: null };

	// Check for wins
	for (var i = 0; i < WIN_SETS.length; i++) {
		var set = WIN_SETS[i];
		if (board[set[0]] && board[set[0]] === board[set[1]] && board[set[0]] === board[set[2]]) {
			result.finished = true;
			result.winner = board[set[0]];
			result.winSet = set;
			return result;
		}
	}

	// Check for draw (all cells filled)
	var filledCells = 0;
	for (var i = 1; i <= 9; i++) {
		if (board['c' + i]) filledCells++;
	}

	if (filledCells === 9) {
		result.finished = true;
	}

	return result;
}

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// Socket client has disconnected
function onClientDisconnect() {
	// util.log("onClientDisconnect: "+this.id);

	var removePlayer = this.player;

	// Guard clause: player may not exist if disconnect happens before 'new player' event
	if (!removePlayer) {
		util.log("Unknown client disconnected: "+this.id);
		return;
	}

	// Notify opponent if paired
	if (removePlayer.opp && removePlayer.opp.sockid) {
		io.to(removePlayer.opp.sockid).emit("opp_disconnect");
	}

	// Safely remove from arrays (check indexOf > -1 to avoid removing wrong player)
	var playerIdx = players.indexOf(removePlayer);
	if (playerIdx > -1) players.splice(playerIdx, 1);

	var availIdx = players_avail.indexOf(removePlayer);
	if (availIdx > -1) players_avail.splice(availIdx, 1);

	if (this.status == "admin") {
		util.log("Admin has disconnected: "+this.uid);
//		updAdmin("Admin has disconnected - uid:"+this.uid + "  --  "+this.name);
	} else {
		util.log("Player has disconnected: "+this.id);
//		updAdmin("player disconnected - uid:"+removePlayer.uid + "  --  "+removePlayer.name);
	}

};

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

set_game_sock_handlers = function (socket) {

	// util.log("New game player has connected: "+socket.id);

	socket.on("new player", onNewPlayer);

	socket.on("ply_turn", onTurn);

	socket.on("disconnect", onClientDisconnect);

};
