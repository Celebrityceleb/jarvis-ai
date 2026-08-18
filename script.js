// ==========================================
// JARVIS - MAIN SCRIPT
// ==========================================

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://oechiufoqtnuofoiatgw.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Pf0mP9qTvCdWCUjZTt-xrA_G4gch1w8";

// ==========================================
// GET PAGE ELEMENTS
// ==========================================

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

    // Stop any previous speech
    window.speechSynthesis.cancel();

    // Speak
    window.speechSynthesis.speak(speech);

    console.log("JARVIS SPEAKING:", text);
}

// ==========================================
// SPEECH ENGINE WARM-UP
// ==========================================

window.addEventListener("load", () => {

    if ("speechSynthesis" in window) {

        const warmup =
            new SpeechSynthesisUtterance("");

        warmup.volume = 0;

        window.speechSynthesis.speak(warmup);

        console.log("JARVIS SPEECH ENGINE READY");
    }
});

// ==========================================
// SUPABASE CONNECTION
// ==========================================

let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
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

if (talkButton) {

    talkButton.addEventListener("click", async () => {

        console.log("JARVIS BUTTON CLICKED");

        // --------------------------------------
        // UPDATE STATUS
        // --------------------------------------

        status.textContent = "JARVIS LISTENING...";

        // --------------------------------------
        // IMMEDIATE LOCAL RESPONSE
        // --------------------------------------

        const localMessage =
            "Hello James. I am JARVIS.";

        response.textContent = localMessage;

        jarvisSpeak(localMessage);

        // --------------------------------------
        // IF SUPABASE IS NOT AVAILABLE
        // --------------------------------------

        if (!supabaseClient) {

            status.textContent = "JARVIS ACTIVE";

            return;
        }

        // --------------------------------------
        // TRY BACKEND CONNECTION
        // --------------------------------------

        try {

            const {
                data: { session },
                error: sessionError
            } = await supabaseClient.auth.getSession();

            // ----------------------------------
            // SESSION ERROR
            // ----------------------------------

            if (sessionError) {

                console.error(
                    "Session error:",
                    sessionError
                );

                status.textContent = "JARVIS ACTIVE";

                return;
            }

            // ----------------------------------
            // NO LOGIN SESSION
            // ----------------------------------

            if (!session) {

                console.log(
                    "No authenticated session found."
                );

                status.textContent = "JARVIS ACTIVE";

                return;
            }

            // ----------------------------------
            // SEND REQUEST TO JARVIS CORE
            // ----------------------------------

            const backendResponse =
                await fetch(
                    `${SUPABASE_URL}/functions/v1/jarvis-core`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${session.access_token}`
                        },

                        body: JSON.stringify({
                            action: "chat",
                            message: "Hello Jarvis"
                        })
                    }
                );

            // ----------------------------------
            // READ BACKEND RESPONSE
            // ----------------------------------

            const data =
                await backendResponse.json();

            console.log(
                "JARVIS BACKEND RESPONSE:",
                data
            );

            // ----------------------------------
            // BACKEND ERROR
            // ----------------------------------

            if (!backendResponse.ok) {

                console.error(
                    "Backend error:",
                    data
                );

                status.textContent =
                    "JARVIS ACTIVE";

                return;
            }

            // ----------------------------------
            // SPEAK BACKEND RESPONSE
            // ----------------------------------

            if (data.reply) {

                response.textContent =
                    data.reply;

                jarvisSpeak(data.reply);
            }

            // ----------------------------------
            // ACTIVE
            // ----------------------------------

            status.textContent =
                "JARVIS ACTIVE";

        } catch (error) {

            console.error(
                "JARVIS CONNECTION ERROR:",
                error
            );

            // ----------------------------------
            // KEEP LOCAL VOICE WORKING
            // ----------------------------------

            status.textContent =
                "JARVIS ACTIVE";
        }

    });

} else {

    console.error(
        "JARVIS ERROR: talkButton was not found."
    );
        }
