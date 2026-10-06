/* =========================================================
   SUPPORT CENTRE CONFIG (edit here)
   Hours are PLACEHOLDERS: replace with the real timings.
   ========================================================= */

const SRG_OFFICE = {
    name: "Rajalakshmi Engineering College",

    address:
        "Rajalakshmi Nagar, Thandalam, Chennai - 602 105, Tamil Nadu",

    email: "customersupport@rajalakshmi.edu.in",

    // text Google Maps searches for (name + address = accurate pin)
    mapQuery:
        "Rajalakshmi Engineering College, Rajalakshmi Nagar, Thandalam, Chennai 602105",

    // device local time. days: 0 = Sunday ... 6 = Saturday
    hours: {
        days: [1, 2, 3, 4, 5, 6],
        open: "09:00",
        close: "17:00"
    }
};


function initializeContact() {

    const office = SRG_OFFICE;

    const map = document.getElementById("office-map");
    const mapLink = document.getElementById("office-map-link");
    const nameEl = document.getElementById("office-name");
    const addressEl = document.getElementById("office-address");
    const directions = document.getElementById("office-directions");
    const emailEl = document.getElementById("office-email");
    const openBadge = document.getElementById("office-open");

    const query = encodeURIComponent(office.mapQuery);


    /* text */

    nameEl.textContent = office.name;
    addressEl.textContent = office.address;

    emailEl.textContent = office.email;
    emailEl.href = `mailto:${office.email}`;


    /* map preview + click to open full map */

    map.src = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;

    mapLink.href =
        `https://www.google.com/maps/search/?api=1&query=${query}`;

    directions.href =
        `https://www.google.com/maps/dir/?api=1&destination=${query}`;


    /* open / closed badge */

    function toMinutes(time) {
        const parts = time.split(":");
        return Number(parts[0]) * 60 + Number(parts[1]);
    }

    function updateOpenBadge() {

        if (!office.hours) {
            return;
        }

        const now = new Date();

        const minutes = now.getHours() * 60 + now.getMinutes();

        const isOpen =
            office.hours.days.includes(now.getDay()) &&
            minutes >= toMinutes(office.hours.open) &&
            minutes < toMinutes(office.hours.close);

        openBadge.textContent = isOpen ? "Open now" : "Closed";
        openBadge.className = "open-badge " + (isOpen ? "open" : "closed");
    }

    updateOpenBadge();

    setInterval(updateOpenBadge, 60000);

}