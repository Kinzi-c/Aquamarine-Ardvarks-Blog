// Imports required modules.
const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const bcrypt = require("bcrypt");

/**
 * Add a new user account to the database.
 * 
 * @param user A JSON object of the user details to be added to the database.
 */
async function addUser(user) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        INSERT INTO users (username, access, fname, lname, description, token, dob, avatar, darkMode) VALUES 
        (${user.username}, ${user.access}, ${user.fname},
        ${user.lname}, ${user.description}, ${user.token}, ${user.dob}, ${user.avatar}, ${user.darkMode});`)

    // Gets the generated ID for the user.
    user.id = result.lastID;
};

/**
 * Gets the user who has the matching username and password. 
 * If no such user exists, returns null.
 * 
 * @param username The users username
 * @param password The users Password
 */
async function getUserWithCredentials(username, password) {
    const db = await dbPromise;

    //creates boolean flags
    let credentialCheck = false;
    const usernames = await getAllUsernames();
    let usernameIsPresent = false;

    usernames.forEach(element => {
        if (username == element.username) {
            usernameIsPresent = true;
        }
    })

    // Gets hashed password associated with username.
    if (usernameIsPresent) {
        const hash = await db.get(SQL`
            SELECT access FROM users WHERE username = ${username}`);

        // Compares hashed password to user login details and returns true or false.
        credentialCheck = bcrypt.compareSync(password, hash.access);
    }

    //If credentials match then user object is passed on, else null is passed on.
    if (credentialCheck) {
        const user = await db.get(SQL`
        SELECT * FROM users WHERE username = ${username}`);
        return user;
    } else { return null; }
};

/**
 * Gets the user account with the authToken provided from the database.
 * Returns undefined if no token exists.
 * 
 * @param token the users authentication token.
 */
async function getUserWithToken(token) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        SELECT * FROM users WHERE token = ${token}`);
        
    return user;
};

/**
 * Gets the user account with the authToken provided from the database.
 * Returns undefined if no token exists.
 * 
 * @param token the users authentication token.
 */
async function getUserWithId(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        SELECT * FROM users WHERE id = ${id}`);

    return user;
};

/**
 * Adds an authentication token to the account if one is not already there.
 * 
 * @param user The user account where the token will be added.
 * @param token The authentication token that will be stored.
 */
async function addToken(user, token) {
    const db = await dbPromise;

    await db.run(SQL`
        UPDATE users SET token = ${token} WHERE users.id = ${user.id}`);
};

/**
 * Updates a users details in the database.
 * 
 * @param user the user details stored in res.locals 
 */
async function updateUserDetails(user) {
    const db = await dbPromise;

    await db.run(SQL`
    UPDATE users SET fname = ${user.fname}, lname = ${user.lname}, access = ${user.access}, description = ${user.description},
    dob = ${user.dob}, avatar = ${user.avatar}, darkMode = ${user.darkMode} WHERE id = ${user.id}`);
};

/**
 * Gets an array of all the usernames currently in use.
 * 
 * @return A JSON object with the list of usernames.
 */
async function getAllUsernames() {
    const db = await dbPromise;

    const usernames = await db.all(SQL`
        SELECT username FROM users`);

    return usernames;
}

/**
 * Deletes a user from the database. Cascade functions remove all corresonding information.
 * 
 * @param userId the unique id of the user to be deleted.
 */
async function deleteUser(userId) {
    const db = await dbPromise;

    await db.run(SQL`
        DELETE FROM users WHERE id = ${userId}`);
};

// Exports the modules
module.exports = {
    addUser,
    getUserWithCredentials,
    getAllUsernames,
    getUserWithToken,
    addToken,
    getUserWithId,
    deleteUser,
    updateUserDetails
};