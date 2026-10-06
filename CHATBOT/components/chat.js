function initializeChat() {

    const chatArea = document.getElementById("chat-area");

    const currentUser = localStorage.getItem("srg_user");

    const historyKey = `srg_chat_history_${currentUser}`;


    function readHistory() {

        try {
            return JSON.parse(localStorage.getItem(historyKey)) || [];
        } catch (error) {
            return [];
        }

    }


    function saveToHistory(sender, message, iso) {

        const history = readHistory();

        history.push({
            sender: sender,
            message: message,
            time: iso
        });

        localStorage.setItem(historyKey, JSON.stringify(history));

    }


    function formatTime(iso) {

        const date = new Date(iso);

        if (isNaN(date)) {
            return "";
        }

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    }


    function makeEl(tag, className, text) {

        const el = document.createElement(tag);

        el.className = className;

        if (text !== undefined) {
            el.textContent = text;   // textContent = no HTML injection
        }

        return el;

    }


    // Build one message row (safe: message goes in via textContent)
    function renderMessage(sender, message, iso) {

        const isUser = sender === "user";

        const row = makeEl(
            "div",
            "message " + (isUser ? "user-message" : "bot-message")
        );

        if (!isUser) {
            const avatar = makeEl("div", "message-avatar", "🛡");
            avatar.setAttribute("aria-hidden", "true");
            row.appendChild(avatar);
        }

        const content = makeEl("div", "message-content");

        content.appendChild(
            makeEl("div", "message-sender", isUser ? "You" : "SRG Support Bot")
        );
        content.appendChild(makeEl("div", "message-bubble", message));
        content.appendChild(makeEl("div", "message-time", formatTime(iso)));

        row.appendChild(content);
        chatArea.appendChild(row);

    }


    window.addUserMessage = function (message, save = true) {

        const iso = new Date().toISOString();

        renderMessage("user", message, iso);

        if (save) {
            saveToHistory("user", message, iso);
        }

        scrollToBottom();
    };


    window.addBotMessage = function (message, save = true) {

        const iso = new Date().toISOString();

        renderMessage("bot", message, iso);

        if (save) {
            saveToHistory("bot", message, iso);
        }

        scrollToBottom();
    };


    function loadChatHistory() {

        readHistory().forEach(function (chat) {

            if (chat.sender === "user" || chat.sender === "bot") {
                renderMessage(
                    chat.sender,
                    chat.message,
                    chat.time || new Date().toISOString()
                );
            }

        });

        scrollToBottom();
    }


    function scrollToBottom() {

        chatArea.scrollTop = chatArea.scrollHeight;

    }


    loadChatHistory();

}