/**
 * User Storage Helper
 * Handles localStorage-based user persistence
 */

const STORAGE_KEY = 'xttt_user';

/**
 * Generate a simple UUID v4
 * @returns {string} UUID string
 */
function generateUserId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get stored user data
 * @returns {Object|null} User object with odid, name, lastPlayed or null if not found
 */
function getUser() {
    try {
        var data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn('Error reading user from localStorage:', e);
    }
    return null;
}

/**
 * Save user data to localStorage
 * @param {string} name - User display name
 * @param {string} [odid] - Optional existing user ID (will generate if not provided)
 * @returns {Object} Saved user object
 */
function saveUser(name, odid) {
    var user = {
        odid: odid || generateUserId(),
        name: name,
        lastPlayed: new Date().toISOString()
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn('Error saving user to localStorage:', e);
    }

    return user;
}

/**
 * Get or create user - returns existing user or creates new one with given name
 * @param {string} name - User display name
 * @returns {Object} User object with odid, name, lastPlayed
 */
function getOrCreateUser(name) {
    var existing = getUser();
    if (existing) {
        // Update name and lastPlayed
        return saveUser(name, existing.odid);
    }
    return saveUser(name);
}

export { getUser, saveUser, getOrCreateUser, generateUserId };
export default { getUser, saveUser, getOrCreateUser, generateUserId };
