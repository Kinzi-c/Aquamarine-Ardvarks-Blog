// Import all required packages.
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

/**
 * Creates a token to be used as a cookie in authentication.
 * 
 * @returns A random string to act as a token.
 */
function createToken() {
    const token = uuid();
    return token;
}

/**
 * Function used to salt and hash passwords. Called before storing user info in the db.
 * 
 * @param password The password the user provides. 
 * @returns A salted and hashed version of the password.
 */
function hash_password(password) {
    const hash = bcrypt.hashSync(password, salt);
    return hash
}

// Export required functions.
module.exports = {
    createToken,
    hash_password,
};