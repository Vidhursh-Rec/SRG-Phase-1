/* =========================================================
   SRG MART — SHOP
   DummyJSON Product Integration
   ========================================================= */

const LOGIN_URL = "../LOGIN/login.html";
const CHAT_URL = "../CHATBOT/chatbot.html";

const currentUser = localStorage.getItem("srg_user");

if (!currentUser) {
    window.location.replace(LOGIN_URL);
}


/* ---------- categories ---------- */

const CATEGORIES = [
    { name: "Fruits & Vegetables", tint: "#e8f5e9" },
    { name: "Electronics",         tint: "#e3f2fd" },
    { name: "Clothing",            tint: "#fff3e0" },
    { name: "Shoes",               tint: "#fff8e1" },
    { name: "Watches",             tint: "#fce4ec" },
    { name: "Household",            tint: "#ede7f6" }
];


/* ---------- state ---------- */

let PRODUCTS = [];

const cart = {};
let activeCategory = "All";
let searchText = "";


/* ---------- elements ---------- */

const sectionsEl = document.getElementById("product-sections");
const categoriesEl = document.getElementById("categories");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const cartLabel = document.getElementById("cart-label");
const toastEl = document.getElementById("toast");


/* ---------- header ---------- */

document.getElementById("user-name").textContent = `Hi, ${currentUser}`;

document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("srg_user");
    window.location.href = LOGIN_URL;
});

document.getElementById("cart-button").addEventListener("click", openCartDrawer);


/* =========================================================
   DUMMYJSON
   ========================================================= */
const CATEGORY_MAP = {
    groceries: "Fruits & Vegetables",

    "kitchen-accessories": "Household",

    furniture: "Household",
    "home-decoration": "Household",

    beauty: "Household",
    "skin-care": "Household",
    fragrances: "Household",

    laptops: "Electronics",
    smartphones: "Electronics",
    tablets: "Electronics",
    "mobile-accessories": "Electronics",

    "mens-shirts": "Clothing",
    "womens-dresses": "Clothing",
    tops: "Clothing",

    "mens-shoes": "Shoes",
    "womens-shoes": "Shoes",

    "mens-watches": "Watches",
    "womens-watches": "Watches"
};


async function loadProducts() {

    try {

        const response = await fetch(
            "https://dummyjson.com/products?limit=0"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        PRODUCTS = data.products.map(function (product) {

            return {
                id: product.id,

                cat:
                    CATEGORY_MAP[product.category]
                    || "Snacks",

                name: product.title,

                weight:
                    product.description.length > 28
                        ? product.description.slice(0, 28) + "..."
                        : product.description,

                price:
                    Math.round(product.price * 83),

                icon: "🛒",

                image: product.thumbnail
            };

        });

        renderCategories();
        renderProducts();
        updateCartLabel();

    } catch (error) {

        console.error("DummyJSON loading failed:", error);

        sectionsEl.innerHTML = `
            <p class="empty">
                Unable to load products. Please refresh the page.
            </p>
        `;

    }

}


/* =========================================================
   RENDER
   ========================================================= */

function renderCategories() {

    categoriesEl.innerHTML = "";

    ["All"].concat(
        CATEGORIES.map(function (c) {
            return c.name;
        })
    ).forEach(function (name) {

        const chip = document.createElement("button");

        chip.type = "button";

        chip.className =
            "chip" +
            (name === activeCategory ? " active" : "");

        chip.textContent = name;

        chip.addEventListener("click", function () {

            activeCategory = name;

            renderCategories();
            renderProducts();

        });

        categoriesEl.appendChild(chip);

    });

}


function productCard(product, tint) {

    const qty = cart[product.id] || 0;


    const action = qty === 0

        ? `
            <button
                type="button"
                class="add-btn"
                data-action="add"
                data-id="${product.id}">
                ADD
            </button>
          `

        : `
            <div class="stepper">

                <button
                    type="button"
                    data-action="dec"
                    data-id="${product.id}"
                    aria-label="Remove one ${product.name}">
                    −
                </button>

                <span>${qty}</span>

                <button
                    type="button"
                    data-action="inc"
                    data-id="${product.id}"
                    aria-label="Add one ${product.name}">
                    +
                </button>

            </div>
          `;


    return `

        <article class="product-card">

            <div
                class="product-img"
                style="background:${tint}"
            >

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

            </div>

            <span class="eta">
                ⏱ 10 MINS
            </span>

            <h3 class="product-name">
                ${product.name}
            </h3>

            <p class="product-weight">
                ${product.weight}
            </p>

            <div class="product-foot">

                <span class="price">
                    ₹${product.price}
                </span>

                ${action}

            </div>

        </article>

    `;

}


function renderProducts() {

    const query =
        searchText.trim().toLowerCase();

    let html = "";
    let shown = 0;


    CATEGORIES.forEach(function (category) {

        if (
            activeCategory !== "All" &&
            activeCategory !== category.name
        ) {
            return;
        }


        const items = PRODUCTS.filter(function (product) {

            return (
                product.cat === category.name &&
                (
                    query === "" ||
                    product.name
                        .toLowerCase()
                        .includes(query)
                )
            );

        });


        if (items.length === 0) {
            return;
        }


        shown += items.length;


        html += `

            <h2 class="section-title">
                ${category.name}
            </h2>

            <div class="product-grid">

                ${items
                    .map(function (product) {
                        return productCard(
                            product,
                            category.tint
                        );
                    })
                    .join("")}

            </div>

        `;

    });


    sectionsEl.innerHTML = html;

    emptyEl.hidden = shown !== 0;

}


/* =========================================================
   CART
   ========================================================= */

function updateCartLabel() {

    let count = 0;
    let total = 0;


    PRODUCTS.forEach(function (product) {

        const qty =
            cart[product.id] || 0;

        count += qty;

        total +=
            qty * product.price;

    });


    cartLabel.textContent =

        count === 0

            ? "My Cart"

            : `${count} item${count > 1 ? "s" : ""} · ₹${total}`;

}


/* ---------- product buttons ---------- */

sectionsEl.addEventListener("click", function (event) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) {
        return;
    }


    const id =
        Number(button.dataset.id);

    const action =
        button.dataset.action;


    if (
        action === "add" ||
        action === "inc"
    ) {

        cart[id] =
            (cart[id] || 0) + 1;

    }


    if (action === "dec") {

        cart[id] =
            (cart[id] || 0) - 1;


        if (cart[id] <= 0) {
            delete cart[id];
        }

    }


    renderProducts();
    updateCartLabel();

});


/* ---------- search ---------- */

searchEl.addEventListener("input", function () {

    searchText =
        searchEl.value;

    renderProducts();

});


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;


function showToast(message) {

    toastEl.textContent =
        message;

    toastEl.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(function () {

            toastEl.classList.remove("show");

        }, 2200);

}


/* =========================================================
   SUPPORT CHAT DRAWER
   ========================================================= */

const chatToggle =
    document.getElementById("chat-toggle");

const chatBackdrop =
    document.getElementById("chat-backdrop");

const chatDrawer =
    document.getElementById("chat-drawer");

const chatFrame =
    document.getElementById("chat-frame");


function openChat() {

    if (!chatFrame.getAttribute("src")) {

        chatFrame.setAttribute(
            "src",
            CHAT_URL
        );

    }


    document.body.classList.add(
        "chat-open"
    );

    chatToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    chatDrawer.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeChat() {

    document.body.classList.remove(
        "chat-open"
    );

    chatToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    chatDrawer.setAttribute(
        "aria-hidden",
        "true"
    );

    chatToggle.focus();

}


chatToggle.addEventListener(
    "click",
    openChat
);

chatBackdrop.addEventListener(
    "click",
    closeChat
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            document.body.classList.contains(
                "chat-open"
            )
        ) {

            closeChat();

        }

    }
);


/* ---------- chatbot close message ---------- */

window.addEventListener(
    "message",
    function (event) {

        if (
            event.origin !==
            window.location.origin
        ) {
            return;
        }


        if (
            event.data &&
            event.data.type ===
            "srg-close-chat"
        ) {

            closeChat();

        }

    }
);


/* =========================================================
   CART DRAWER
   ========================================================= */

const cartBackdrop =
    document.getElementById(
        "cart-backdrop"
    );

const cartDrawer =
    document.getElementById(
        "cart-drawer"
    );

const cartItemsEl =
    document.getElementById(
        "cart-items"
    );

const cartFooterEl =
    document.getElementById(
        "cart-footer"
    );


function renderCartDrawer() {

    const items =
        PRODUCTS.filter(function (product) {

            return cart[product.id];

        });


    if (items.length === 0) {

        cartItemsEl.innerHTML =
            '<p class="cart-empty">🛒 Your cart is empty</p>';

        cartFooterEl.innerHTML = "";

        return;

    }


    let total = 0;


    cartItemsEl.innerHTML =
        items.map(function (product) {

            const qty =
                cart[product.id];

            const subtotal =
                qty * product.price;

            total += subtotal;


            const category =
                CATEGORIES.find(
                    function (c) {
                        return c.name ===
                            product.cat;
                    }
                );


            const tint =
                category
                    ? category.tint
                    : "#f3f3f3";


            return `

                <div class="cart-row">

                    <div
                        class="cart-row-icon"
                        style="background:${tint}"
                    >

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                    </div>

                    <div class="cart-row-info">

                        <div class="cart-row-name">
                            ${product.name}
                        </div>

                        <div class="cart-row-weight">
                            ${product.weight} × ${qty}
                        </div>

                    </div>

                    <div class="cart-row-price">
                        ₹${subtotal}
                    </div>

                </div>

            `;

        }).join("");


    cartFooterEl.innerHTML = `

        <div class="cart-total-row">

            <span>Total</span>

            <span>₹${total}</span>

        </div>

        <button
            type="button"
            class="cart-checkout-btn"
            id="checkout-btn">

            Proceed to Checkout

        </button>

    `;


    document
    .getElementById("checkout-btn")
    .addEventListener(
        "click",
        function () {

            // Dummy order placement
            Object.keys(cart).forEach(function (id) {
                delete cart[id];
            });

            renderCartDrawer();
            updateCartLabel();

            showToast("✅ Your order has been placed!");

        }
    );
}


function openCartDrawer() {

    renderCartDrawer();

    document.body.classList.add(
        "cart-open"
    );

    cartDrawer.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeCartDrawer() {

    document.body.classList.remove(
        "cart-open"
    );

    cartDrawer.setAttribute(
        "aria-hidden",
        "true"
    );

}


document
    .getElementById("cart-close")
    .addEventListener(
        "click",
        closeCartDrawer
    );

cartBackdrop.addEventListener(
    "click",
    closeCartDrawer
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            document.body.classList.contains(
                "cart-open"
            )
        ) {

            closeCartDrawer();

        }

    }
);


/* =========================================================
   START
   ========================================================= */

renderCategories();

loadProducts();