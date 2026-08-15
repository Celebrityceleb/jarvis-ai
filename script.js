const talkButton = document.getElementById("talkButton");
const response = document.getElementById("response");
const status = document.getElementById("status");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    response.textContent =
        "Sorry, speech recognition is not supported in this browser.";

} else {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    talkButton.addEventListener("click", () => {

        status.textContent = "LISTENING...";
        response.textContent = "I'm listening...";

        recognition.start();
    });

    recognition.onresult = (event) => {

        const spokenText =
            event.results[0][0].transcript;

        status.textContent = "MESSAGE RECEIVED";

        response.textContent =
            `You said: "${spokenText}"`;
    };

    recognition.onerror = (event) => {

        status.textContent = "ERROR";

        response.textContent =
            "I couldn't hear you. Please try again.";

        console.log(
            "Speech recognition error:",
            event.error
        );
    };

    recognition.onend = () => {
        status.textContent = "SYSTEM READY";
    };
              }
