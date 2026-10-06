/* =========================================================
   SRG PROJECT — LOGIN SYSTEM
   ========================================================= */

// Login elements
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");

const createAccountBtn = document.getElementById("create-account");
const backToLoginBtn = document.getElementById("back-to-login");

const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");


// =========================================================
// LOGIN
// =========================================================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    loginError.textContent = "";

    if (!username || !password) {
        loginError.textContent = "Please enter username and password.";
        return;
    }

    // Get stored accounts
    const accounts =
        JSON.parse(localStorage.getItem("srg_accounts")) || {};

    // Check credentials
    if (
        accounts[username] &&
        accounts[username].password === password
    ) {

        // Store logged-in user
        localStorage.setItem("srg_user", username);

        // Go directly to chatbot
        window.location.href = "../CHATBOT/chatbot.html";

    } else {

        loginError.textContent =
            "Invalid username or password.";
    }
});


// =========================================================
// CREATE ACCOUNT
// =========================================================

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document
        .getElementById("register-username")
        .value
        .trim();

    const password = document
        .getElementById("register-password")
        .value;

    const confirmPassword = document
        .getElementById("confirm-password")
        .value;

    registerError.textContent = "";


    // Validate username
    if (!username) {
        registerError.textContent =
            "Please enter a username.";
        return;
    }


    // Validate password
    if (!password) {
        registerError.textContent =
            "Please enter a password.";
        return;
    }


    // Confirm password
    if (password !== confirmPassword) {
        registerError.textContent =
            "Passwords do not match.";
        return;
    }


    // Get existing accounts
    const accounts =
        JSON.parse(localStorage.getItem("srg_accounts")) || {};


    // Check duplicate username
    if (accounts[username]) {

        registerError.textContent =
            "Username already exists.";

        return;
    }


    // Create account
    accounts[username] = {
        password: password
    };


    // Save account
    localStorage.setItem(
        "srg_accounts",
        JSON.stringify(accounts)
    );


    // Automatically log in
    localStorage.setItem(
        "srg_user",
        username
    );


    // Redirect to chatbot
    window.location.href =
        "../CHATBOT/chatbot.html";

});


// =========================================================
// SWITCH TO CREATE ACCOUNT
// =========================================================

createAccountBtn.addEventListener("click", function () {

    loginForm.style.display = "none";
    registerForm.style.display = "block";

    formTitle.textContent = "CREATE ACCOUNT";

    formSubtitle.textContent =
        "Create your SRG access credentials.";

    loginError.textContent = "";
    registerError.textContent = "";

});


// =========================================================
// SWITCH BACK TO LOGIN
// =========================================================

backToLoginBtn.addEventListener("click", function () {

    registerForm.style.display = "none";
    loginForm.style.display = "block";

    formTitle.textContent = "WELCOME BACK";

    formSubtitle.textContent =
        "Sign in to continue to SRG.";

    loginError.textContent = "";
    registerError.textContent = "";

});


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

const togglePassword =
    document.getElementById("toggle-password");

const passwordInput =
    document.getElementById("password");


togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "○";
        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "◉";
        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );
    }

});


// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword =
    document.getElementById("forgot-password");

forgotPassword.addEventListener("click", function (event) {

    event.preventDefault();

    loginError.textContent =
        "Password recovery is not available in this demo.";

});