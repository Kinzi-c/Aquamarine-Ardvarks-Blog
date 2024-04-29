window.addEventListener("load",  function () {

// Initialise boolean flags to use.    
let uniqueName = false;
let doPasswordsMatch = false;

// Grabs the username input field and add the p field to notify user if username is taken. Then adds an event listener to the users input.
let newUsername = document.querySelector('#newUsername');
let usernameNotification = document.querySelector('#usernameTaken');

// Grabs the avatar input field (this is hidden via css) that is used to store the avatar value.
// Event listeners are added to avatars and when clicked, their corresonding image name is added to the avatarInput field to be sent to the db on submit.
let tempAvatar = null;
let avatarInput = document.querySelector('#avatarInput');
let avatarImage = document.getElementsByClassName('avatar');
    [...avatarImage].map((item)=>{
        item.addEventListener('click',function (event) {
            if (tempAvatar) {
                tempAvatar.classList.toggle("avatarBorder");
            }
            avatarInput.value = event.target.alt;
            event.target.classList.toggle("avatarBorder");
            tempAvatar = event.target;
        })
    })

// Grabs the values for the passwords and the p field to notify the user.    
let passwordOne = document.querySelector("#passwordOne");
let reEnterPass = document.querySelector("#reEnterPass");
let passwordNotification = document.querySelector("#passwordMatch");

// Grabs the submit button in order to enable it when the user has a unique user name and matching passwords.
let submitButton = document.querySelector("#submitButton");

// adds event listeners to variables if they are present (This pages logic is used for account creation and login)
if(newUsername){newUsername.addEventListener('input', updateUsernameValue);}
if(passwordOne){passwordOne.addEventListener('blur', updatePasswordOne);}
if(reEnterPass){reEnterPass.addEventListener('blur', updateReEnterPass);}

/**
 * First function that is called when event listener fires for username check.
 * 
 * @param event event thrown from listener.
 */
function updateUsernameValue(event) {
    checkIfUsernameExists(event.target.value);
};

/**
 * Uses fetchUsernameArray to get all the usernames from the db and checks the users desired username against each one to ensure it is unique.
 * If it is not unique the doesUserNameExist boolean flag will return true and a message will display to the user that the username is already taken.
 * 
 * @param username The users desired username (value thrown by the eventlistener). 
 */
async function checkIfUsernameExists(username) {
    const usernamesArray = await fetchUsernameArray();
    let doesUserNameExist = false;
    
    // Checks each username against the ones in the database.
    usernamesArray.forEach(element => {
        if (element.username === username) {
            doesUserNameExist = true;
        }})
    // Updates notification field if username exists, leaves blank if it does not exist.    
    if(doesUserNameExist) {
        usernameNotification.innerHTML = "Sorry, this name is taken, please pick another";
        uniqueName = false;
    } else {
        usernameNotification.innerHTML = "";
        uniqueName = true;
    }
    // Checks to see if the form can be submitted.
    canFormBeSubmitted(uniqueName, doPasswordsMatch);
    
};
    
/**
 * Fetch function to grab an array of usernames from the database.
 * 
 * @returns array of usernames
 */
async function fetchUsernameArray() {
    const response = await fetch("/newAccountUsernames");
    const usernames = await response.json();

    return usernames;
};

/**
 * First function that is called when event listener fires to check if passwords match.
 * 
 * @param event event thrown from listener.
 */
 function checkPasswords(pass1, pass2) {
    // Check for match and respond by notifying the user and updating boolean values.
    if (pass1 == pass2) {
        passwordNotification.innerHTML = "";
        doPasswordsMatch = true;
    } else {
        passwordNotification.innerHTML = "Sorry, your passwords do not match";
        doPasswordsMatch = false;
    }
    canFormBeSubmitted(uniqueName, doPasswordsMatch);
};

// Helper function to update passwordOne value and check for match
function updatePasswordOne(event) {
    passwordOne = event.target.value;
    checkPasswords(passwordOne, reEnterPass);
}
// Helper function to update second password value and check for match
function updateReEnterPass(event) {
    reEnterPass = event.target.value;
    checkPasswords(passwordOne, reEnterPass);
}

// Helper function used to disable or enable submit value based on boolean values.
function canFormBeSubmitted(username, password) {
    if (username && password && password != "") {
        submitButton.removeAttribute("disabled");
    } else {
        submitButton.setAttribute("disabled", "");
    }

};
});
