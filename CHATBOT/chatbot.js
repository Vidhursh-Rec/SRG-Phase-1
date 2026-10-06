const LOGIN_URL = "../LOGIN/login.html";

const COMPONENTS = [
    { id: "header-component",  name: "header" },
    { id: "topbar-component",  name: "topbar" },
    { id: "status-component",  name: "status" },
    { id: "contact-component", name: "contact" },
    { id: "chat-component",    name: "chat" },
    { id: "input-component",   name: "input" }
];

const currentUser = localStorage.getItem("srg_user");


async function loadComponent(componentId, filePath) {

    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Failed to load ${filePath} (${response.status})`);
    }

    document.getElementById(componentId).innerHTML =
        await response.text();

}


function loadScript(filePath) {

    return new Promise(function (resolve, reject) {

        const script = document.createElement("script");

        script.src = filePath;
        script.onload = resolve;
        script.onerror = function () {
            reject(new Error(`Failed to load ${filePath}`));
        };

        document.body.appendChild(script);

    });

}


function showLoadError(error) {

    console.error(error);

    const box = document.createElement("div");

    box.className = "load-error";
    box.setAttribute("role", "alert");
    box.textContent =
        "> ERROR: could not load chatbot components. " +
        "Serve this folder with a local server " +
        "(e.g. python -m http.server), not file://. " +
        `Details: ${error.message}`;

    document.querySelector(".main-content").prepend(box);

}


async function loadChatbotComponents() {

    try {

        // load in parallel
        await Promise.all(
            COMPONENTS.map(function (c) {
                return loadComponent(c.id, `components/${c.name}.html`);
            })
        );

        await Promise.all(
            COMPONENTS.map(function (c) {
                return loadScript(`components/${c.name}.js`);
            })
        );

        initializeHeader();
        initializeTopbar();
        initializeStatus();
        initializeContact();
        initializeChat();
        initializeInput();

    } catch (error) {

        showLoadError(error);

    }

}


const SHOP_URL = "../SHOP/shop.html";

const EMBEDDED = window.self !== window.top;

// add ?standalone=1 to the URL to open the chatbot on its own (testing)
const STANDALONE = new URLSearchParams(window.location.search).has("standalone");

if (!currentUser) {

    // log out of the whole page, not just the iframe
    window.top.location.replace(LOGIN_URL);

} else if (!EMBEDDED && !STANDALONE) {

    // the chatbot lives inside the shop's side drawer
    window.location.replace(SHOP_URL);

} else {

    loadChatbotComponents();

}