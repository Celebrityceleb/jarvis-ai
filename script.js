const talkButton = document.getElementById("talkButton");
const response = document.getElementById("response");
const status = document.getElementById("status");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    status.textContent = "NOT SUPPORTED";

    response.textContent =
        "Speech recognition is not supported by this browser.";

} else {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    talkButton.addEventListener("click", () => {

        status.textContent = "LISTENING...";
        response.textContent = "I'm listening...";

        try {
            recognition.start();
        } catch (error) {
            console.log("Recognition start error:", error);
        }
    });

    recognition.onresult = (event) => {

        const spokenText =
            event.results[0][0].transcript;

        status.textContent = "MESSAGE RECEIVED";

        response.textContent =
            `You said: "${spokenText}"`;

        console.log("Speech received:", spokenText);
    };

    recognition.onerror = (event) => {

        status.textContent = "ERROR";

        response.textContent =
            `Speech recognition error: ${event.error}`;

        console.log("Speech recognition error:", event.error);
    };

    recognition.onend = () => {

        status.textContent = "SYSTEM READY";

        if (response.textContent === "I'm listening...") {

            response.textContent =
                "Listening ended. No speech result was received.";
        }
    };
}
