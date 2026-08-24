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
// JARVIS — MICROPHONE INPUT
// ==========================================

let jarvisMicrophoneStream = null;
let jarvisAudioRecorder = null;
let jarvisAudioChunks = [];


// ==========================================
// START MICROPHONE
// ==========================================

async function startJarvisMicrophone() {

    try {

        setStatus(
            "MICROPHONE STARTING..."
        );

        setResponse(
            "Activating microphone..."
        );

        console.log(
            "JARVIS: Requesting microphone access..."
        );


        jarvisMicrophoneStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        console.log(
            "JARVIS: Microphone access granted."
        );

        setStatus(
            "LISTENING..."
        );

        setResponse(
            "I'm listening."
        );

        jarvisSpeak(
            "I'm listening."
        );


        // ======================================
        // CREATE AUDIO RECORDER
        // ======================================

        jarvisAudioChunks = [];

        jarvisAudioRecorder =
            new MediaRecorder(
                jarvisMicrophoneStream
            );


        jarvisAudioRecorder.ondataavailable =
            function(event) {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    jarvisAudioChunks.push(
                        event.data
                    );

                }

            };


        jarvisAudioRecorder.onstop =
    async function() {

        console.log(
            "JARVIS: Audio recording stopped."
        );


        const audioBlob =
            new Blob(
                jarvisAudioChunks,
                {
                    type:
                        jarvisAudioRecorder.mimeType ||
                        "audio/webm"
                }
            );


        console.log(
            "JARVIS AUDIO SIZE:",
            audioBlob.size
        );


        stopJarvisMicrophone();


        setStatus(
            "PROCESSING..."
        );

        setResponse(
            "Audio captured. Processing speech..."
        );


        try {

            const formData =
                new FormData();


            formData.append(
                "audio",
                audioBlob,
                "jarvis-recording.webm"
            );


            console.log(
                "JARVIS: Sending audio to speech endpoint..."
            );


            const result =
                await fetch(
                    "https://oechiufoqtnuofoiatgw.supabase.co/functions/v1/jarvis-speech",
                    {
                        method: "POST",

                        headers: {
                            "apikey":
                                SUPABASE_ANON_KEY
                        },

                        body:
                            formData
                    }
                );


            console.log(
                "JARVIS SPEECH STATUS:",
                result.status
            );


            const responseText =
                await result.text();


            console.log(
                "JARVIS SPEECH RESPONSE:",
                responseText
            );


            if (!result.ok) {

                throw new Error(
                    responseText
                );

            }


            let data =
                JSON.parse(
                    responseText
                );


            const transcript =
    data.transcript ||
    data.text;


if (transcript) {

    const command =
        transcript.trim().toLowerCase();


    console.log(
        "JARVIS COMMAND:",
        command
    );


    // ======================================
    // TIME COMMAND
    // ======================================

    if (
        command.includes("what time") ||
        command.includes("current time") ||
        command === "time" ||
        command.includes("tell me the time")
    ) {

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

        setStatus(
            "JARVIS ACTIVE"
        );

        setResponse(
            message
        );

        jarvisSpeak(
            message
        );

        return;
    }


    // ======================================
    // GREETING
    // ======================================

    if (
        command.includes("hello jarvis") ||
        command.includes("hi jarvis") ||
        command === "hello" ||
        command === "hi"
    ) {

        const message =
            "Hello James. How can I help you?";

        setStatus(
            "JARVIS ACTIVE"
        );

        setResponse(
            message
        );

        jarvisSpeak(
            message
        );

        return;
    }


    // ======================================
    // OPEN WEB
    // ======================================

    if (
        command.includes("open google") ||
        command.includes("open the web") ||
        command.includes("open web")
    ) {

        const message =
            "Opening the web.";

        setStatus(
            "JARVIS ACTIVE"
        );

        setResponse(
            message
        );

        jarvisSpeak(
            message
        );


        setTimeout(
            function() {

                window.open(
                    "https://www.google.com",
                    "_blank"
                );

            },
            500
        );

        return;
    }


    // ======================================
    // UNKNOWN COMMAND
    // ======================================

    const message =
        `I heard you say "${transcript}". I don't know that command yet.`;

    setStatus(
        "JARVIS ACTIVE"
    );

    setResponse(
        message
    );

    jarvisSpeak(
        message
    );


} else {

    setStatus(
        "JARVIS ACTIVE"
    );

    setResponse(
        "Audio received, but no speech text was returned."
    );

}


        } catch (error) {

            console.error(
                "JARVIS SPEECH PROCESSING ERROR:",
                error
            );


            setStatus(
                "JARVIS ACTIVE"
            );

            setResponse(
                "I couldn't process the audio."
            );

            jarvisSpeak(
                "I couldn't process the audio."
            );

        }

    };


        jarvisAudioRecorder.onerror =
            function(error) {

                console.error(
                    "JARVIS AUDIO RECORDER ERROR:",
                    error
                );

                stopJarvisMicrophone();

                setStatus(
                    "JARVIS ACTIVE"
                );

                setResponse(
                    "I couldn't access the microphone."
                );

            };


        jarvisAudioRecorder.start();


        console.log(
            "JARVIS: Recording started."
        );


        // Record for 5 seconds for this first test.
        setTimeout(
            function() {

                if (
                    jarvisAudioRecorder &&
                    jarvisAudioRecorder.state ===
                        "recording"
                ) {

                    jarvisAudioRecorder.stop();

                }

            },
            5000
        );


    } catch (error) {

        console.error(
            "JARVIS MICROPHONE ERROR:",
            error
        );


        setStatus(
            "JARVIS ACTIVE"
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            setResponse(
                "Microphone permission was denied."
            );

            jarvisSpeak(
                "Microphone permission was denied."
            );

        } else {

            setResponse(
                "I could not access the microphone."
            );

            jarvisSpeak(
                "I could not access the microphone."
            );

        }

    }

}


// ==========================================
// STOP MICROPHONE
// ==========================================

function stopJarvisMicrophone() {

    if (jarvisMicrophoneStream) {

        jarvisMicrophoneStream
            .getTracks()
            .forEach(
                function(track) {

                    track.stop();

                }
            );

        jarvisMicrophoneStream =
            null;

    }

}


// ==========================================
// TALK BUTTON
// ==========================================

if (talkButton) {

    talkButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            console.log(
                "JARVIS: Talk button pressed."
            );

            startJarvisMicrophone();

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
        "What would you like me to search for?"
    );

    jarvisSpeak(
        "What would you like me to search for?"
    );

    setTimeout(
        function() {

            const query =
                prompt(
                    "JARVIS SEARCH\n\nWhat would you like to search for?"
                );

            if (!query || !query.trim()) {

                setResponse(
                    "Search cancelled."
                );

                return;
            }

            const searchQuery =
                query.trim();

            setResponse(
                `Searching for "${searchQuery}"...`
            );

            jarvisSpeak(
                `Searching for ${searchQuery}.`
            );

            const searchURL =
                "https://www.google.com/search?q=" +
                encodeURIComponent(
                    searchQuery
                );

            window.open(
                searchURL,
                "_blank"
            );

        },
        300
    );

    return;
            }

            if (tool === "web") {

    setResponse(
        "Opening the web."
    );

    jarvisSpeak(
        "Opening the web."
    );

    setTimeout(
        function() {

            window.open(
                "https://www.google.com",
                "_blank"
            );

        },
        300
    );

    return;
            }

            if (tool === "remind") {

    setResponse(
        "What should I remind you about?"
    );

    jarvisSpeak(
        "What should I remind you about?"
    );

    setTimeout(
        function() {

            const reminder =
                prompt(
                    "JARVIS REMINDER\n\nWhat should I remind you about?"
                );

            if (!reminder || !reminder.trim()) {

                setResponse(
                    "Reminder cancelled."
                );

                return;
            }

            const reminderText =
                reminder.trim();

            const reminders =
                JSON.parse(
                    localStorage.getItem(
                        "jarvisReminders"
                    ) || "[]"
                );

            reminders.push({

                text:
                    reminderText,

                created:
                    new Date().toLocaleString(
                        "en-NG"
                    )

            });

            localStorage.setItem(
                "jarvisReminders",
                JSON.stringify(
                    reminders
                )
            );

            setResponse(
                `Reminder saved: "${reminderText}"`
            );

            jarvisSpeak(
                `Reminder saved. ${reminderText}`
            );

        },
        300
    );

    return;
                }

            if (tool === "notes") {

    setResponse(
        "What would you like me to save?"
    );

    jarvisSpeak(
        "What would you like me to save?"
    );

    setTimeout(
        function() {

            const note =
                prompt(
                    "JARVIS NOTES\n\nWhat would you like me to save?"
                );

            if (!note || !note.trim()) {

                setResponse(
                    "Note cancelled."
                );

                return;
            }

            const noteText =
                note.trim();

            const notes =
                JSON.parse(
                    localStorage.getItem(
                        "jarvisNotes"
                    ) || "[]"
                );

            notes.push({

                text:
                    noteText,

                created:
                    new Date().toLocaleString(
                        "en-NG"
                    )

            });

            localStorage.setItem(
                "jarvisNotes",
                JSON.stringify(
                    notes
                )
            );

            setResponse(
                `Note saved: "${noteText}"`
            );

            jarvisSpeak(
                `Note saved. ${noteText}`
            );

        },
        300
    );

    return;
            }

            if (tool === "system") {

    const browser =
        navigator.userAgent;

    const language =
        navigator.language;

    const online =
        navigator.onLine
            ? "ONLINE"
            : "OFFLINE";

    const screenWidth =
        window.screen.width;

    const screenHeight =
        window.screen.height;


    const message =
        `System online. Network ${online}. ` +
        `Language ${language}. ` +
        `Screen ${screenWidth} by ${screenHeight}.`;


    setResponse(
        message
    );

    jarvisSpeak(
        message
    );


    console.log(
        "JARVIS SYSTEM STATUS"
    );

    console.log(
        "Browser:",
        browser
    );

    console.log(
        "Language:",
        language
    );

    console.log(
        "Network:",
        online
    );

    console.log(
        "Screen:",
        `${screenWidth} x ${screenHeight}`
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

// ==========================================
// JARVIS — RECOVERY SCRIPT
// PART 2 / 3
// ==========================================


// ==========================================
// MEMORY SYSTEM
// ==========================================

const createMemoryButton =
    document.getElementById(
        "createMemoryButton"
    );

const memoryModal =
    document.getElementById(
        "memoryModal"
    );

const memoryModalTitle =
    document.getElementById(
        "memoryModalTitle"
    );

const memoryInput =
    document.getElementById(
        "memoryInput"
    );

const cancelMemory =
    document.getElementById(
        "cancelMemory"
    );

const saveMemory =
    document.getElementById(
        "saveMemory"
    );

const clearMemoriesButton =
    document.getElementById(
        "clearMemoriesButton"
    );


let editingMemoryIndex = null;


// ==========================================
// GET MEMORIES
// ==========================================

function getMemories() {

    try {

        const stored =
            localStorage.getItem(
                "jarvisMemories"
            );

        if (!stored) {
            return [];
        }

        const memories =
            JSON.parse(stored);

        return Array.isArray(memories)
            ? memories
            : [];

    } catch (error) {

        console.error(
            "JARVIS MEMORY READ ERROR:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE MEMORIES
// ==========================================

function saveMemoryArray(memories) {

    try {

        localStorage.setItem(
            "jarvisMemories",
            JSON.stringify(memories)
        );

        return true;

    } catch (error) {

        console.error(
            "JARVIS MEMORY SAVE ERROR:",
            error
        );

        return false;

    }

}


// ==========================================
// ESCAPE MEMORY TEXT
// ==========================================

function escapeMemoryText(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// OPEN NEW MEMORY
// ==========================================

if (createMemoryButton) {

    createMemoryButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            editingMemoryIndex =
                null;

            if (memoryModalTitle) {

                memoryModalTitle.textContent =
                    "NEW MEMORY";

            }

            if (saveMemory) {

                saveMemory.textContent =
                    "SAVE MEMORY";

            }

            if (memoryInput) {

                memoryInput.value =
                    "";

            }

            if (memoryModal) {

                memoryModal.classList.add(
                    "show"
                );

            }

            if (memoryInput) {

                setTimeout(
                    function() {

                        memoryInput.focus();

                    },
                    50
                );

            }

        }
    );

}


// ==========================================
// CANCEL MEMORY
// ==========================================

if (cancelMemory) {

    cancelMemory.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeMemoryModal();

        }
    );

}


// ==========================================
// CLOSE MEMORY MODAL
// ==========================================

function closeMemoryModal() {

    if (memoryModal) {

        memoryModal.classList.remove(
            "show"
        );

    }

    editingMemoryIndex =
        null;

}


// ==========================================
// SAVE MEMORY
// ==========================================

if (saveMemory) {

    saveMemory.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            if (!memoryInput) {
                return;
            }

            const text =
                memoryInput.value.trim();

            if (!text) {

                alert(
                    "Please enter something for JARVIS to remember."
                );

                return;

            }

            const memories =
                getMemories();


            // ----------------------------------
            // EDIT EXISTING MEMORY
            // ----------------------------------

            if (
                editingMemoryIndex !== null &&
                memories[editingMemoryIndex]
            ) {

                memories[
                    editingMemoryIndex
                ].text =
                    text;

                memories[
                    editingMemoryIndex
                ].date =
                    new Date()
                        .toLocaleDateString(
                            "en-NG"
                        );

                saveMemoryArray(
                    memories
                );

                closeMemoryModal();

                loadMemories();

                setResponse(
                    "Memory updated."
                );

                setStatus(
                    "JARVIS ACTIVE"
                );

                jarvisSpeak(
                    "Memory updated."
                );

                return;

            }


            // ----------------------------------
            // CREATE NEW MEMORY
            // ----------------------------------

            memories.push({

                text:
                    text,

                date:
                    new Date()
                        .toLocaleDateString(
                            "en-NG"
                        )

            });

            saveMemoryArray(
                memories
            );

            closeMemoryModal();

            loadMemories();

            setResponse(
                "Memory saved."
            );

            setStatus(
                "JARVIS ACTIVE"
            );

            jarvisSpeak(
                "Memory saved."
            );

        }
    );

}


// ==========================================
// LOAD MEMORIES
// ==========================================

function loadMemories() {

    const memoryContent =
        document.querySelector(
            ".memory-content"
        );

    if (!memoryContent) {
        return;
    }

    const createButton =
        document.getElementById(
            "createMemoryButton"
        );


    document
        .querySelectorAll(
            ".saved-memory"
        )
        .forEach(
            function(card) {

                card.remove();

            }
        );


    const memories =
        getMemories();


    memories.forEach(
        function(memory, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "memory-card saved-memory";


            card.innerHTML = `

                <div class="memory-title">
                    SAVED
                </div>

                <div class="memory-text">
                    ${escapeMemoryText(
                        memory.text
                    )}
                </div>

                <div class="memory-date">
                    ${escapeMemoryText(
                        memory.date || ""
                    )}
                </div>

                <div class="memory-actions">

                    <button
                        type="button"
                        class="memory-edit"
                        data-index="${index}"
                    >
                        EDIT
                    </button>

                    <button
                        type="button"
                        class="memory-delete"
                        data-index="${index}"
                    >
                        DELETE
                    </button>

                </div>

            `;


            if (createButton) {

                memoryContent.insertBefore(
                    card,
                    createButton
                );

            } else {

                memoryContent.appendChild(
                    card
                );

            }

        }
    );


    attachMemoryActions();

}


// ==========================================
// MEMORY ACTIONS
// ==========================================

function attachMemoryActions() {


    // --------------------------------------
    // EDIT MEMORY
    // --------------------------------------

    document
        .querySelectorAll(
            ".memory-edit"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const memories =
                            getMemories();

                        if (!memories[index]) {
                            return;
                        }

                        editingMemoryIndex =
                            index;


                        if (memoryModalTitle) {

                            memoryModalTitle.textContent =
                                "EDIT MEMORY";

                        }


                        if (saveMemory) {

                            saveMemory.textContent =
                                "SAVE CHANGES";

                        }


                        if (memoryInput) {

                            memoryInput.value =
                                memories[index].text;

                        }


                        if (memoryModal) {

                            memoryModal.classList.add(
                                "show"
                            );

                        }


                        if (memoryInput) {

                            setTimeout(
                                function() {

                                    memoryInput.focus();

                                },
                                50
                            );

                        }

                    }
                );

            }
        );


    // --------------------------------------
    // DELETE MEMORY
    // --------------------------------------

    document
        .querySelectorAll(
            ".memory-delete"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const memories =
                            getMemories();

                        if (!memories[index]) {
                            return;
                        }


                        const confirmed =
                            confirm(
                                "Delete this memory?"
                            );

                        if (!confirmed) {
                            return;
                        }


                        memories.splice(
                            index,
                            1
                        );


                        saveMemoryArray(
                            memories
                        );


                        loadMemories();


                        setResponse(
                            "Memory deleted."
                        );

                        setStatus(
                            "JARVIS ACTIVE"
                        );

                        jarvisSpeak(
                            "Memory deleted."
                        );

                    }
                );

            }
        );

}


// ==========================================
// CLEAR ALL MEMORIES
// ==========================================

if (clearMemoriesButton) {

    clearMemoriesButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const memories =
                getMemories();

            if (!memories.length) {

                setResponse(
                    "There are no memories to clear."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Clear all JARVIS memories?"
                );

            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "jarvisMemories"
            );


            loadMemories();


            setResponse(
                "All memories cleared."
            );

            setStatus(
                "JARVIS ACTIVE"
            );

            jarvisSpeak(
                "All memories have been cleared."
            );

        }
    );

}


// ==========================================
// END PART 2
// ==========================================

// ==========================================
// JARVIS — RECOVERY SCRIPT
// PART 3 / 3
// ==========================================


// ==========================================
// INITIALIZATION
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "JARVIS: DOM ready."
        );

        loadMemories();

        updateTime();

        setInterval(
            updateTime,
            1000
        );

    }
);


// ==========================================
// CLOSE MEMORY MODAL WHEN BACKDROP IS TAPPED
// ==========================================

if (memoryModal) {

    memoryModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                memoryModal
            ) {

                closeMemoryModal();

            }

        }
    );

}


// ==========================================
// JARVIS READY STATE
// ==========================================

setStatus(
    "JARVIS ONLINE"
);

setResponse(
    "System ready. Tap TALK TO JARVIS."
);


// ==========================================
// SAFETY CHECK
// ==========================================

console.log(
    "=========================================="
);

console.log(
    "JARVIS RECOVERY SCRIPT LOADED."
);

console.log(
    "Talk button:",
    talkButton
);

console.log(
    "Navigation buttons:",
    navigationButtons.length
);

console.log(
    "Screens:",
    screens.length
);

console.log(
    "Tool cards:",
    toolCards.length
);

console.log(
    "Memory button:",
    createMemoryButton
);

console.log(
    "=========================================="
);


// ==========================================
// END PART 3
// ==========================================
