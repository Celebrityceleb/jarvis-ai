// ==========================================
// JARVIS — RECOVERY SCRIPT
// PART 1 / 3
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://oechiufoqtnuofoiatgw.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Pf0mP9qTvCdWCUjZTt-xrA_G4gch1w8";

let supabaseClient = null;

try {

    if (window.supabase) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

        console.log(
            "JARVIS: Supabase connected."
        );

    } else {

        console.warn(
            "JARVIS: Supabase library not available."
        );

    }

} catch (error) {

    console.error(
        "JARVIS: Supabase initialization error:",
        error
    );

}


// ==========================================
// MAIN ELEMENTS
// ==========================================

const talkButton =
    document.getElementById("talkButton");

const response =
    document.getElementById("response");

const status =
    document.getElementById("status");


// ==========================================
// SAFE UI
// ==========================================

function setResponse(text) {

    if (response) {
        response.textContent = text;
    }

}


function setStatus(text) {

    if (status) {
        status.textContent = text;
    }

}


// ==========================================
// JARVIS VOICE
// ==========================================

function jarvisSpeak(text) {

    if (!text) {
        return;
    }

    if (!("speechSynthesis" in window)) {

        console.warn(
            "JARVIS: Speech synthesis unavailable."
        );

        return;
    }

    try {

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";
        speech.rate = 0.95;
        speech.pitch = 0.9;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);

    } catch (error) {

        console.error(
            "JARVIS VOICE ERROR:",
            error
        );

    }

}


// ==========================================
// NAVIGATION
// ==========================================

const navigationButtons =
    document.querySelectorAll(".nav-button");

const screens =
    document.querySelectorAll(".screen");


navigationButtons.forEach(button => {

    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const target =
                this.getAttribute("data-screen");

            console.log(
                "JARVIS NAVIGATION:",
                target
            );

            if (!target) {
                return;
            }

            const selectedScreen =
                document.getElementById(target);

            if (!selectedScreen) {

                console.error(
                    "JARVIS: Screen not found:",
                    target
                );

                return;
            }

            screens.forEach(screen => {

                screen.classList.remove(
                    "active-screen"
                );

            });

            selectedScreen.classList.add(
                "active-screen"
            );

            navigationButtons.forEach(nav => {

                nav.classList.remove("active");

            });

            this.classList.add("active");

            if (target === "toolsScreen") {

                updateTime();

            }

        }
    );

});


// ==========================================
// TALK TO JARVIS
// ==========================================

if (talkButton) {

    talkButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            console.log(
                "JARVIS: Talk button pressed."
            );

            const greeting =
                "Hello James. I am JARVIS.";

            setStatus(
                "JARVIS ACTIVE"
            );

            setResponse(
                greeting
            );

            jarvisSpeak(
                greeting
            );

        }
    );

} else {

    console.error(
        "JARVIS: talkButton was not found."
    );

}


// ==========================================
// TIME ELEMENTS
// ==========================================

const timePanel =
    document.getElementById("timePanel");

const currentTime =
    document.getElementById("currentTime");

const currentDate =
    document.getElementById("currentDate");

const closeTimeTool =
    document.getElementById("closeTimeTool");

const speakTimeButton =
    document.getElementById("speakTimeButton");


// ==========================================
// UPDATE TIME
// ==========================================

function updateTime() {

    if (!currentTime || !currentDate) {
        return;
    }

    const now =
        new Date();

    currentTime.textContent =
        now.toLocaleTimeString(
            "en-NG",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );

    currentDate.textContent =
        now.toLocaleDateString(
            "en-NG",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


// ==========================================
// TOOL CARDS
// ==========================================

const toolCards =
    document.querySelectorAll(".tool-card");


toolCards.forEach(card => {

    card.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const tool =
                this.getAttribute("data-tool");

            console.log(
                "JARVIS TOOL:",
                tool
            );

            if (tool === "time") {

                if (timePanel) {

                    timePanel.classList.add(
                        "show"
                    );

                }

                updateTime();

                return;
            }

            if (tool === "search") {

                setResponse(
                    "Search tool is ready."
                );

                return;
            }

            if (tool === "web") {

                setResponse(
                    "Web tool is ready."
                );

                return;
            }

            if (tool === "remind") {

                setResponse(
                    "Reminder tool is coming online."
                );

                return;
            }

            if (tool === "notes") {

                setResponse(
                    "Notes tool is ready."
                );

                return;
            }

            if (tool === "system") {

                setResponse(
                    "System controls are ready."
                );

                return;
            }

        }
    );

});


// ==========================================
// CLOSE TIME PANEL
// ==========================================

if (closeTimeTool) {

    closeTimeTool.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            if (timePanel) {

                timePanel.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ==========================================
// SPEAK TIME
// ==========================================

if (speakTimeButton) {

    speakTimeButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const now =
                new Date();

            const time =
                now.toLocaleTimeString(
                    "en-NG",
                    {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                    }
                );

            const message =
                `The current time is ${time}.`;

            setResponse(
                message
            );

            jarvisSpeak(
                message
            );

        }
    );

}


// ==========================================
// END PART 1
// ==========================================
