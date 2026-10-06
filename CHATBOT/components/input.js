function initializeInput() {

    // n8n webhook (change here if the backend moves)
    const CHAT_API_URL = "http://localhost:5678/webhook/srg-chat";

    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const attachmentButton = document.getElementById("attachment-button");

    let busy = false;


    messageForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = messageInput.value.trim();

        // ignore empty input and double-submit while waiting
        if (message === "" || busy) {
            return;
        }

        busy = true;
        sendButton.disabled = true;

        addUserMessage(message);

        messageInput.value = "";

        try {

            const response = await fetch(CHAT_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_input: message
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json();

            addBotMessage(
                data.final_response ||
                "Sorry, I received an empty response."
            );

            updateSRGStatus({
                ...data,

                decision: data.escalated
                    ? "ESCALATED"
                    : data.approved
                        ? "ALLOW"
                        : "REFINING"
            });

        } catch (error) {

            console.error("Chat API error:", error);

            addBotMessage(
                "Sorry, I’m unable to connect to the SRG Support Bot right now."
            );

        } finally {

            busy = false;
            sendButton.disabled = false;
            messageInput.focus();

        }

    });


    attachmentButton.addEventListener("click", function () {

        alert("File attachment will be available soon.");

    });

}