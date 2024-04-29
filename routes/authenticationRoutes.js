const express = require("express");
const authRouter = express.Router();

const usersDao = require("../modules/users-dao.js");
const auth = require("../modules/authentication.js");


// Directs to the login page (needs work on authentication tokens etc)
authRouter.get("/login", function (req, res) {
    res.render("login");
});

// Router runs when user sumbits a login. Parses body information and checks it against the db. If login successful a token is
// generated and added to the cookies and updated in the db.
authRouter.post("/login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // Checks user information against the db.
    const user = await usersDao.getUserWithCredentials(username, password);

    // If login successful a token is generated and added to the cookies and db. The user is then redirected to the home page with a toast message.
    if (user) {
        const token = auth.createToken();
        res.cookie("token", token);
        usersDao.addToken(user, token);
        user.token = token;
        res.locals.user = user;
        res.setToastMessage("Login Successfull!");
        res.redirect("/home");
    }

    // If login fails toast message is updated and user is asked to login again.
    else {
        res.locals.user = null;
        res.clearCookie("token");
        res.setToastMessage("Login failed, please try again");
        res.redirect("/login");
    }
});

// Router runs when the logout button is triggered (needs work around identifying is user is already logged in or not)
authRouter.get("/logout", function (req, res) {
    res.clearCookie("token");
    res.setToastMessage("You have successfully logged out");
    res.redirect("/");
});

// Handler used to get all the usernames from the db and sends them to the client side js
authRouter.get("/newAccount", async function (req, res) {
    res.locals.accountCreation = true;
    const usernameArray = await usersDao.getAllUsernames();
    res.render("new-account");
});

// Handler used to provide the array of usernames from the db
authRouter.get("/newAccountUsernames", async function (req, res) {
    const usernameArray = await usersDao.getAllUsernames();
    res.json(usernameArray);
})

authRouter.get("/user", function (req, res) {
    res.json(res.locals.user);
});

// Handles the html post request for account creation.
authRouter.post("/createAccount", async function (req, res) {
    const passwordOne = req.body.passwordOne;

    const hash = auth.hash_password(passwordOne);
    const user = {
        "username": req.body.username, "access": hash, "fname": req.body.fname,
        "lname": req.body.lname, "description": req.body.description, "token": auth.createToken(), "dob": req.body.dob, "avatar": req.body.avatar
    };
    res.locals.user = user;
    res.cookie("token", user.token);
    // Tries to create new account in the db, if fails user is informed and redirected to the account creattion to try again.
    try {
        await usersDao.addUser(user);
        res.setToastMessage("Account created successfully!");
        res.redirect("home");
    } catch (error) {
        console.log(error);
        res.setToastMessage("The account could not be created, please try again");
        res.redirect("/newAccount")
    }
});

// Post route used when deleting a user account.
authRouter.post("/deleteAccount", async function (req, res) {
    usersDao.deleteUser(res.locals.user.id);
    res.redirect("/home");
});

// Post route used to update the users details from the settings page.
authRouter.post("/updateAccount", async function (req, res) {
    let user = res.locals.user;

    let fullName = req.body.fullname;
    // grabs the new name and splits it at the comma, informs the user if this has not been done correctly. 
    // Then adds the new first and last name to the db along with the new description and dob if changed.
    const nameArray = fullName.split(",");
    if (nameArray.length != 2) {
        res.setToastMessage("Please enter your first name and last name seperated by a comma(,)");
        res.redirect("/settings");
    } else {
        user.fname = nameArray[0].trim();
        user.lname = nameArray[1].trim();
        user.description = req.body.description;
        user.dob = req.body.dob;

        usersDao.updateUserDetails(user)
        res.setToastMessage("Profile successfully updated");
        res.redirect("/settings");
    }
});

// Post function used to update the password. Grabs the user details from db if their old password is correct. Updates db with new hashed salted password.
authRouter.post("/changePassword", async function (req, res) {
    const user = await usersDao.getUserWithCredentials(res.locals.user.username, req.body.oldPassword)
    if (user) {
        const hash = auth.hash_password(req.body.newPassword);
        user.access = hash;
        await usersDao.updateUserDetails(user);
        res.setToastMessage("Great, your password has been changed. Please login with the new Password");
        res.redirect("/login");
    } else {
        res.setToastMessage("Sorry, your password was not correct");
        res.redirect("/settings");
    }
});

// Routes to the settings page and adds boolean flag.
authRouter.get("/settings", function (req, res) {
    res.locals.settingsPage = true;
    res.render("settings");
});

// Post request used to update the users avatar
authRouter.post("/updateAvatar", async function (req, res) {
    let user = res.locals.user;
    user.avatar = req.body.avatar;
    usersDao.updateUserDetails(user);
    res.setToastMessage("Avatar updated successfully");
    res.redirect("/settings")
});

// Post request used to update the users general settings (Darkmode at this stage).
authRouter.post("/updateSettings", async function (req, res) {
    const isDarkmode = req.body.modulator;
    if (isDarkmode == "DarkMode") {
        res.locals.user.darkMode = 1;
        usersDao.updateUserDetails(res.locals.user);
        res.setToastMessage("Your settings have been updated!")
        res.redirect("/settings");
    } else {
        res.locals.user.darkMode = 0;
        usersDao.updateUserDetails(res.locals.user);
        res.setToastMessage("Your settings have been updated!")
        res.redirect("/settings");
    }
});

// export router.
module.exports = authRouter;