const SUPABASE_URL = "https://oechiufoqtnuofoiatgw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Pf0mP9qTvCdWCUjZTt-xrA_G4gch1w8";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
const talkButton = document.getElementById("talkButton");
const response = document.getElementById("response");
const status = document.getElementById("status");
function jarvisSpeak(text) {
    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "en-US";
    voice.rate = 0.95;
    voice.pitch = 0.9;
    voice.volume = 1;
window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
}
console.log("JARVIS SPEAKING:", text);
talkButton.addEventListener("click", async () => {
    status.textContent = "JARVIS LISTENING...";
    console.log("FIRST TAP RECEIVED");
    jarvisSpeak("Hello James. I am JARVIS.");
});
