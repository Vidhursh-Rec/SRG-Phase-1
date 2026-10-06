function initializeHeader() {

    const backButton = document.getElementById("back-button");
    const menuButton = document.getElementById("menu-button");
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");


    /* Sign out (logs out and returns to login) */

    const embedded = window.self !== window.top;

    if (embedded) {

        // inside the shop drawer: close the chat panel
        backButton.textContent = "✕";
        backButton.setAttribute("aria-label", "Close chat");
        backButton.setAttribute("title", "Close chat");

        backButton.addEventListener("click", function () {
            window.parent.postMessage(
                { type: "srg-close-chat" },
                window.location.origin
            );
        });

    } else {

        backButton.addEventListener("click", function () {
            localStorage.removeItem("srg_user");
            window.location.href = "../LOGIN/login.html";
        });

    }


    /* Menu */

    menuButton.addEventListener("click", function () {
        alert("Menu will be available soon.");
    });


    /* Theme */

    function applyTheme(theme) {

        document.body.classList.toggle(
            "dark-theme",
            theme === "dark"
        );

        themeIcon.textContent =
            theme === "dark" ? "☀" : "☾";

        const label =
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode";

        themeToggle.setAttribute("aria-label", label);
        themeToggle.setAttribute("title", label);
    }


    applyTheme(localStorage.getItem("srg-theme") || "light");


    themeToggle.addEventListener("click", function () {

        const newTheme =
            document.body.classList.contains("dark-theme")
                ? "light"
                : "dark";

        localStorage.setItem("srg-theme", newTheme);

        applyTheme(newTheme);
    });

}