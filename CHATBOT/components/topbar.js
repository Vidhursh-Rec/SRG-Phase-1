/* =========================================================
   HELP CONTACTS (edit here). Add  phone: "+91 ..."  to show
   a number under the email.
   ========================================================= */

const HELP_CONTACTS = [
    { name: "Jashareen", email: "jashareen@gmail.com", phone: "" },
    { name: "Meenakshi", email: "meenakshi@gmail.com", phone: "" },
    { name: "Vidhursh",  email: "vidhursh@gmail.com",  phone: "" }
];


function initializeTopbar() {

    const searchInput = document.getElementById("topbar-search");
    const sideToggle = document.getElementById("side-toggle");
    const helpButton = document.getElementById("help-button");
    const helpDialog = document.getElementById("help-dialog");
    const helpClose = document.getElementById("help-close");
    const helpList = document.getElementById("help-list");
    const bellButton = document.getElementById("bell-button");
    const upgradeButton = document.getElementById("upgrade-button");


    /* Search: hide messages that do not match */

    searchInput.addEventListener("input", function () {

        const query = searchInput.value.trim().toLowerCase();

        document
            .querySelectorAll("#chat-area .message")
            .forEach(function (message) {

                const match =
                    query === "" ||
                    message.textContent.toLowerCase().includes(query);

                message.style.display = match ? "" : "none";

            });

    });


    /* Small screens: open / close side panel */

    sideToggle.addEventListener("click", function () {

        document
            .querySelector(".main-content")
            .classList.toggle("show-side");

    });


    /* Placeholders until these features exist */

    /* Help dialog: contact list */

    HELP_CONTACTS.forEach(function (person) {

        const item = document.createElement("li");
        item.className = "help-item";

        const name = document.createElement("div");
        name.className = "help-name";
        name.textContent = person.name;
        item.appendChild(name);

        const email = document.createElement("a");
        email.href = `mailto:${person.email}`;
        email.textContent = person.email;
        item.appendChild(email);

        if (person.phone) {
            const phone = document.createElement("a");
            phone.href = `tel:${person.phone.replace(/\s+/g, "")}`;
            phone.textContent = person.phone;
            item.appendChild(phone);
        }

        helpList.appendChild(item);

    });

    helpButton.addEventListener("click", function () {
        helpDialog.showModal();
    });

    helpClose.addEventListener("click", function () {
        helpDialog.close();
    });

    // click on the dimmed backdrop closes it
    helpDialog.addEventListener("click", function (event) {
        if (event.target === helpDialog) {
            helpDialog.close();
        }
    });

    bellButton.addEventListener("click", function () {
        alert("No new notifications.");
    });

    upgradeButton.addEventListener("click", function () {
        alert("Upgrade options will be available soon.");
    });

}