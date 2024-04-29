// Adds required JS 
const usersDao = require("../modules/users-dao");

// Middleware function that checks it there is a user in the db that matches the token stored in the local cookie.
// Returns the user if ther is.
async function addUserToLocals(req, res, next) {
    const user = await usersDao.getUserWithToken(req.cookies.token);
    res.locals.user = user;
    next();
}

// If the user is added to locals, this function also adds an 'access' flag and checks whether the user is currently using 'DarkMode'.
// If the user is using DarkMode then a flad is added to res.locals.
function verifyAuthenticated(req, res, next) {
    if (res.locals.user) {
        res.locals.access = true;
        if (res.locals.user.darkMode == 1) {
            res.locals.darkMode = true;
    }
}
    next();
}


module.exports = {
    addUserToLocals,
    verifyAuthenticated,
}