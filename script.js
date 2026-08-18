// ==========================================
// JARVIS - MAIN SCRIPT
// ==========================================

// Supabase configuration
const SUPABASE_URL = "https://oechiufoqtnuofoiatgw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Pf0mP9qTvCdWCUjZTt-xrA_G4gch1w8";

// Get elements from the page
const talkButton = document.getElementById("talkButton");
const response = document.getElementById("response");
const status = document.getElementById("status");


// ==========================================
// JARVIS VOICE
// ==========================================

function jarvisSpeak(text) {

    if (!("speechSynthesis" in window)) {
        console.error("Speech synthesis is not supported.");
        return;
    }

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);

    console.log("JARVIS SPEAKING:", text);
}
// Warm up the speech engine
window.addEventListener("load", () => {
    if ("speechSynthesis" in window) {
        const warmup = new SpeechSynthesisUtterance("");
        warmup.volume = 0;
        window.speechSynthesis.speak(warmup);
    }
});

// ==========================================
// SUPABASE CONNECTION
// ==========================================

let supabaseClient = null;

if (window.supabase) {

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    console.log("Supabase connected.");

} else {

    console.warn(
        "Supabase library was not loaded. JARVIS will still be able to speak."
    );
}


// ==========================================
// TALK BUTTON
// ==========================================

talkButton.addEventListener("click", async () => {

    console.log("JARVIS BUTTON CLICKED");

    status.textContent = "JARVIS LISTENING...";


    // --------------------------------------
    // Immediate voice response
    // --------------------------------------

    const localMessage =
        "Hello James. I am JARVIS.";

    response.textContent = localMessage;

    jarvisSpeak(localMessage);


    // --------------------------------------
    // Try connecting to the backend
    // --------------------------------------

    if (!supabaseClient) {
        status.textContent = "JARVIS ACTIVE";
        return;
    }


    try {

        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {
            console.error(
                "Session error:",
                sessionError
            );

            status.textContent = "JARVIS ACTIVE";
            return;
        }


        // ----------------------------------
        // No logged-in session yet
        // ----------------------------------

        if (!session) {

            console.log(
                "No authenticated session found."
            );

            status.textContent = "JARVIS ACTIVE";

            return;
        }


        // ----------------------------------
        // Send request to jarvis-core
        // ----------------------------------

        const backendResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/jarvis-core`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${session.access_token}`
                },

                body: JSON.stringify({
                    action: "chat",
                    message: "Hello Jarvis"
                })
            }
        );


        const data = await backendResponse.json();


        console.log(
            "JARVIS BACKEND RESPONSE:",
            data
        );


        if (!backendResponse.ok) {

            console.error(
                "Backend error:",
                data
            );

            status.textContent = "JARVIS ACTIVE";

            return;
        }


        // ----------------------------------
        // Display backend response
        // ----------------------------------

        if (data.reply) {

            response.textContent = data.reply;

            jarvisSpeak(data.reply);
        }


        status.textContent = "JARVIS ACTIVE";


    } catch (error) {

        console.error(
            "JARVIS CONNECTION ERROR:",
            error
        );

        // Keep the local voice response working
        status.textContent = "JARVIS ACTIVE";
    }

});
