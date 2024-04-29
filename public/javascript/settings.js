window.addEventListener('load', async function () {
    // Grab the user data from res.locals
    const user = await fetchUserData();

    // Grab the delete button, add an event listener and bring forward the modal confirming deletion.
    let deleteAccountButton = document.querySelector("#deleteButton");
    deleteAccountButton.addEventListener("click", function () {
        document.querySelector("#confirmDeleteModal").style.display = 'block';
    });

    // Grabs the changepassword button, adds an event listener and brings forward the modal to change the password.
    let changePasswordButton = document.querySelector("#passwordButton");
    changePasswordButton.addEventListener("click", function () {
        document.querySelector("#changePasswordModal").style.display = 'block';
    });

    // Grabs the change avatar button and brings forward the change avatar modal.
    let userAvatar = document.querySelector("#avatarButton");
    userAvatar.addEventListener("click", function () {
        document.querySelector("#changeAvatarModal").style.display = 'block';
    });

    // Grabs all elements needed to track darkmode. 
    let darkMode = document.querySelector("#darkMode");
    let modulator = document.querySelector("#modulator");
    let prompt = document.querySelector("#darkModeMessage")
    // Adds event listener to the darkmode button to call helper function if clicked. Sets image and prompt based on users setting current setting.
    darkMode.addEventListener("click", updateDarkMode)
    if (user.darkMode == 1) {
        modulator.value = "DarkMode";
        prompt.innerHTML = "Your profile is in DarkMode";
        darkMode.setAttribute('permanent', '');
    } else {
        modulator.value = "Lightmode";
        prompt.innerHTML = "Your profile is in LightMode";
    }
    
    // Grabs elements from change password modal and adds event listeners to check for equality of passwords.
    let newPassword = document.querySelector("#newPassword");
    let reEnterPass = document.querySelector("#reEnterPass");
    let notification = document.querySelector("#passwordNotification");
    let updateButton = document.querySelector("#updateButton");

    newPassword.addEventListener("blur", updateNewPass);
    reEnterPass.addEventListener("input", updateReEnterPass);

    // Grabs avatar images to be used for change avatar modal and adds listeners.
    let tempAvatar = null
    let avatarInput = document.querySelector('#avatarInput');
    let avatars = document.getElementsByClassName('avatar');
    [...avatars].map((item) => {
        item.addEventListener('click', function (event) {
            if (tempAvatar) {
                tempAvatar.classList.toggle("avatarBorder");
            }
            avatarInput.value = event.target.alt;
            event.target.classList.toggle("avatarBorder");
            tempAvatar = event.target;
        })
    })

    // Helper function to update the password field if user changes their mind.
    function updateNewPass(event) {
        newPassword = event.target.value;
    };
    // Helper function that grabs re-entered password, checks for equality and sets update button accordingly and also prompts the user.
    function updateReEnterPass(event) {
        reEnterPass = event.target.value;
        if (reEnterPass != newPassword | reEnterPass == "") {
            notification.innerHTML = "New password does not match or is empty";
            updateButton.setAttribute("disabled", "");
        } else {
            notification.innerHTML = "";
            updateButton.removeAttribute("disabled");
        }
    }

    // Async function to fetch user data as a JSON from the db.
    async function fetchUserData() {
        const response = await fetch("/user");
        const user = response.json();

        return user;
    };

    // Helper function to updates the hidden input field and prompts the user when they toggle darkmode. 
    function updateDarkMode(event) {
        if (event.target.mode == "dark") {
            event.mode;
            modulator.value = "DarkMode";
            prompt.innerHTML = "Your profile will be set to DarkMode";
        } else {
            modulator.value = "LightMode";
            prompt.innerHTML = "Your profile will be set to LightMode";
        }
    }
});