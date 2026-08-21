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
// PAGE ELEMENTS
// ==========================================

const talkButton =
    document.getElementById("talkButton");

const response =
    document.getElementById("response");

const status =
    document.getElementById("status");


// ==========================================
// JARVIS VOICE
// ==========================================

function jarvisSpeak(text) {

    if (!("speechSynthesis" in window)) {

        console.error(
            "Speech synthesis is not supported."
        );

        return;
    }


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-US";

    speech.rate = 0.95;

    speech.pitch = 0.9;

    speech.volume = 1;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);


    console.log(
        "JARVIS SPEAKING:",
        text
    );
}


// ==========================================
// SPEECH ENGINE WARM-UP
// ==========================================

window.addEventListener(
    "load",
    () => {

        if ("speechSynthesis" in window) {

            const warmup =
                new SpeechSynthesisUtterance("");

            warmup.volume = 0;

            window.speechSynthesis.speak(
                warmup
            );

        }

    }
);


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


    console.log(
        "Supabase connected."
    );

}


// ==========================================
// TALK BUTTON
// ==========================================

if (talkButton) {

    talkButton.addEventListener(
        "click",
        async () => {

            status.textContent =
                "JARVIS LISTENING...";


            const localMessage =
                "Hello James. I am JARVIS.";


            response.textContent =
                localMessage;


            jarvisSpeak(
                localMessage
            );


            if (!supabaseClient) {

                status.textContent =
                    "JARVIS ACTIVE";

                return;
            }


            try {

                const {
                    data: { session },
                    error: sessionError
                } =
                    await supabaseClient
                        .auth
                        .getSession();


                if (sessionError) {

                    console.error(
                        "Session error:",
                        sessionError
                    );

                    status.textContent =
                        "JARVIS ACTIVE";

                    return;
                }


                if (!session) {

                    console.log(
                        "No authenticated session found."
                    );

                    status.textContent =
                        "JARVIS ACTIVE";

                    return;
                }


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

                                message:
                                    "Hello Jarvis"

                            })

                        }
                    );


                const data =
                    await backendResponse.json();


                console.log(
                    "JARVIS BACKEND RESPONSE:",
                    data
                );


                if (!backendResponse.ok) {

                    console.error(
                        "Backend error:",
                        data
                    );

                    status.textContent =
                        "JARVIS ACTIVE";

                    return;
                }


                if (data.reply) {

                    response.textContent =
                        data.reply;

                    jarvisSpeak(
                        data.reply
                    );

                }


                status.textContent =
                    "JARVIS ACTIVE";


            } catch (error) {

                console.error(
                    "JARVIS CONNECTION ERROR:",
                    error
                );

                status.textContent =
                    "JARVIS ACTIVE";

            }

        }
    );

}


// ==========================================
// MICROPHONE TEST
// ==========================================

async function testMicrophone() {

    try {

        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    audio: true
                });


        console.log(
            "MICROPHONE ACCESS GRANTED"
        );


        status.textContent =
            "MICROPHONE READY";


        stream
            .getTracks()
            .forEach(
                track => {
                    track.stop();
                }
            );


    } catch (error) {

        console.error(
            "MICROPHONE ERROR:",
            error
        );


        status.textContent =
            "MICROPHONE ERROR";

    }

}


// ==========================================
// SCREEN NAVIGATION
// ==========================================

const navigationButtons =
    document.querySelectorAll(
        ".nav-button"
    );


const screens =
    document.querySelectorAll(
        ".screen"
    );


navigationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const targetScreen =
                    button.getAttribute(
                        "data-screen"
                    );


                screens.forEach(
                    screen => {

                        screen.classList.remove(
                            "active-screen"
                        );

                    }
                );


                const selectedScreen =
                    document.getElementById(
                        targetScreen
                    );


                if (selectedScreen) {

                    selectedScreen.classList.add(
                        "active-screen"
                    );

                }


                navigationButtons.forEach(
                    navButton => {

                        navButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                console.log(
                    "JARVIS NAVIGATION:",
                    targetScreen
                );

            }
        );

    }
);


// ==========================================
// MEMORY ELEMENTS
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


// ==========================================
// MEMORY EDITING STATE
// ==========================================

let editingMemoryIndex = null;


// ==========================================
// GET MEMORIES
// ==========================================

function getMemories() {

    return JSON.parse(
        localStorage.getItem(
            "jarvisMemories"
        )
    ) || [];

}


// ==========================================
// SAVE MEMORY ARRAY
// ==========================================

function saveMemoryArray(memories) {

    localStorage.setItem(
        "jarvisMemories",
        JSON.stringify(memories)
    );

}


// ==========================================
// OPEN CREATE MEMORY
// ==========================================

if (createMemoryButton) {

    createMemoryButton.addEventListener(
        "click",
        () => {

            editingMemoryIndex = null;


            memoryModalTitle.textContent =
                "NEW MEMORY";


            saveMemory.textContent =
                "SAVE MEMORY";


            memoryInput.value = "";


            memoryModal.classList.add(
                "show"
            );


            memoryInput.focus();

        }
    );

}


// ==========================================
// CLOSE MEMORY MODAL
// ==========================================

if (cancelMemory) {

    cancelMemory.addEventListener(
        "click",
        () => {

            memoryModal.classList.remove(
                "show"
            );


            editingMemoryIndex = null;

        }
    );

}


// ==========================================
// SAVE OR UPDATE MEMORY
// ==========================================

if (saveMemory) {

    saveMemory.addEventListener(
        "click",
        () => {

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


            // ==================================
            // EDIT EXISTING MEMORY
            // ==================================

            if (
                editingMemoryIndex !== null
            ) {

                memories[
                    editingMemoryIndex
                ].text = text;


                memories[
                    editingMemoryIndex
                ].date =
                    new Date()
                        .toLocaleDateString();


                saveMemoryArray(
                    memories
                );


                memoryModal.classList.remove(
                    "show"
                );


                editingMemoryIndex = null;


                loadMemories();


                updateJarvisStatus(
                    "Memory updated."
                );


                jarvisSpeak(
                    "Memory updated."
                );


                return;

            }


            // ==================================
            // CREATE NEW MEMORY
            // ==================================

            memories.push({

                text: text,

                date:
                    new Date()
                        .toLocaleDateString()

            });


            saveMemoryArray(
                memories
            );


            memoryModal.classList.remove(
                "show"
            );


            loadMemories();


            updateJarvisStatus(
                "Memory saved."
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

    const memories =
        getMemories();


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
            memory => {
                memory.remove();
            }
        );


    memories.forEach(
        (memory, index) => {

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
                        memory.date
                    )}
                </div>

                <div class="memory-actions">

                    <button
                        class="memory-edit"
                        data-index="${index}"
                    >
                        EDIT
                    </button>

                    <button
                        class="memory-delete"
                        data-index="${index}"
                    >
                        DELETE
                    </button>

                </div>

            `;


            memoryContent.insertBefore(
                card,
                createButton
            );

        }
    );


    attachMemoryActions();

}


// ==========================================
// EDIT / DELETE BUTTONS
// ==========================================

function attachMemoryActions() {


    // ======================================
    // EDIT
    // ======================================

    document
        .querySelectorAll(
            ".memory-edit"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        const memories =
                            getMemories();


                        if (
                            !memories[index]
                        ) {
                            return;
                        }


                        editingMemoryIndex =
                            index;


                        memoryModalTitle.textContent =
                            "EDIT MEMORY";


                        saveMemory.textContent =
                            "SAVE CHANGES";


                        memoryInput.value =
                            memories[index].text;


                        memoryModal.classList.add(
                            "show"
                        );


                        memoryInput.focus();

                    }
                );

            }
        );


    // ======================================
    // DELETE
    // ======================================

    document
        .querySelectorAll(
            ".memory-delete"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        const memories =
                            getMemories();


                        if (
                            !memories[index]
                        ) {
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


                        updateJarvisStatus(
                            "Memory deleted."
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
        () => {

            const memories =
                getMemories();


            if (
                memories.length === 0
            ) {

                jarvisSpeak(
                    "There are no saved memories to clear."
                );


                updateJarvisStatus(
                    "NO MEMORIES"
                );


                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete all saved memories?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "jarvisMemories"
            );


            loadMemories();


            updateJarvisStatus(
                "ALL MEMORIES CLEARED"
            );


            jarvisSpeak(
                "All saved memories have been cleared."
            );

        }
    );

}


// ==========================================
// UPDATE JARVIS STATUS
// ==========================================

function updateJarvisStatus(message) {

    if (response) {

        response.textContent =
            message;

    }


    if (status) {

        status.textContent =
            "JARVIS ACTIVE";

    }

}


// ==========================================
// PROTECT MEMORY TEXT
// ==========================================

function escapeMemoryText(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ==========================================
// LOAD MEMORIES ON STARTUP
// ==========================================

loadMemories();
