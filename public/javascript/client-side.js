window.addEventListener("load", function () {

// Redirect user to create new article page on click
const createArticleButton = document.querySelector("#create-button");
if(createArticleButton){
    createArticleButton.addEventListener("click", createArticle);

    function createArticle(){
        
        window.location.href = "/newArticle";
    }
}
// Redirect user to newAccount page on click
const signupButton = document.querySelector("#signup");
if(signupButton){
    signupButton.addEventListener("click", loadSignupPage);
    function loadSignupPage(){
        window.location.href = "/newAccount";
    }
}

// Get the backToTop button
const mybutton = document.getElementById("backToTopButton");
if(mybutton){

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
mybutton.addEventListener("click", topFunction);
// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.documentElement.scrollTop = 0;
}
}

// Redirect user to login page on click
const loginButton = document.querySelector("#login");
if(loginButton){
    loginButton.addEventListener("click", loadLoginPage);
    function loadLoginPage(){
        window.location.href = "/login";
    }
}

// Redirect user to profile page on click
const profileButton = document.querySelector("#avatar");
if(profileButton){
    profileButton.addEventListener("click", loadProfilePage);
    function loadProfilePage(){
        window.location.href = "/profile";
    }
}

// Grabs the username input field and add the p field to notify user if username is taken. Then adds an event listener to the users input.
let newUsername = document.querySelector('#newUsername');
let notification = document.querySelector('#usernameTaken');

// Grabs the submit button in order to disable it if username is already taken.
let submitButton = document.querySelector("#submitButton");
if(submitButton){
    newUsername.addEventListener('input', updateValue);
}
/**
 * First function that is called when event listener fires.
 * 
 * @param event event thrown from listener.
 */
function updateValue(event) {
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
        notification.innerHTML = "Sorry, this name is taken, please pick another";
        submitButton.toggleAttribute("disabled");
    } else {
        notification.innerHTML = "";
        submitButton.toggleAttribute("disabled")
    }};
    
/**
 * Fetch function to grab an array of usernames from the database.
 * 
 * @returns array of usernames
 */
async function fetchUsernameArray() {
    const response = await fetch("/newAccount");
    const usernames = await response.json();

    return usernames;
};
  
});