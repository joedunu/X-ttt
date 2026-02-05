/**************************************************
** LEADERBOARD MODULE
** Handles persistence and retrieval of player stats
**************************************************/
var fs = require('fs');
var path = require('path');

var DATA_FILE = path.join(__dirname, 'data', 'leaderboard.json');

/**
 * Load leaderboard data from JSON file
 * @returns {Object} Leaderboard data with players object
 */
function loadData() {
    try {
        var data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is invalid, return empty structure
        return { players: {} };
    }
}

/**
 * Save leaderboard data to JSON file
 * @param {Object} data - Leaderboard data to save
 */
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving leaderboard data:', err);
    }
}

/**
 * Record a game result for a player
 * @param {string} odid - Persistent user ID
 * @param {string} name - Player display name
 * @param {string} outcome - 'win', 'loss', or 'draw'
 */
function recordResult(odid, name, outcome) {
    if (!odid || !name || !outcome) return;

    var data = loadData();

    if (!data.players[odid]) {
        data.players[odid] = {
            name: name,
            wins: 0,
            losses: 0,
            draws: 0
        };
    }

    // Update name in case it changed
    data.players[odid].name = name;

    // Increment the appropriate counter
    switch (outcome) {
        case 'win':
            data.players[odid].wins++;
            break;
        case 'loss':
            data.players[odid].losses++;
            break;
        case 'draw':
            data.players[odid].draws++;
            break;
    }

    saveData(data);
}

/**
 * Get top players sorted by wins
 * @param {number} limit - Maximum number of players to return
 * @returns {Array} Array of player objects sorted by wins descending
 */
function getTopPlayers(limit) {
    limit = limit || 10;

    var data = loadData();
    var playersArray = [];

    // Convert players object to array
    for (var odid in data.players) {
        if (Object.prototype.hasOwnProperty.call(data.players, odid)) {
            playersArray.push({
                odid: odid,
                name: data.players[odid].name,
                wins: data.players[odid].wins,
                losses: data.players[odid].losses,
                draws: data.players[odid].draws
            });
        }
    }

    // Sort by wins descending
    playersArray.sort(function(a, b) {
        return b.wins - a.wins;
    });

    // Return top N players
    return playersArray.slice(0, limit);
}

// Export functions
exports.loadData = loadData;
exports.saveData = saveData;
exports.recordResult = recordResult;
exports.getTopPlayers = getTopPlayers;
