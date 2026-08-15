const talkButton = document.getElementById("talkButton");
const response = document.getElementById("response");
const status = document.getElementById("status");

function jarvisSpeak(text) {
    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "en-US";
    voice.rate = 0.95;
    voice.pitch = 0.9;
    voice.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
}

talkButton.addEventListener("click", () => {

    status.textContent = "JARVIS ACTIVE";

    const message =
        "Hello. I am Jarvis. Your system is online.";

    response.textContent = message;

    jarvisSpeak(message);
});
