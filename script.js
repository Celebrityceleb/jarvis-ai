// ==========================================
// JARVIS — MAIN SCRIPT
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://oechiufoqtnuofoiatgw.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Pf0mP9qTvCdWCUjZTt-xrA_G4gch1w8";


let supabaseClient = null;


if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    console.log(
        "JARVIS: Supabase connected."
    );

}


// ==========================================
// MAIN ELEMENTS
// ==========================================

const talkButton =
    document.getElementById(
        "talkButton"
    );

const response =
    document.getElementById(
        "response"
    );

const status =
    document.getElementById(
        "status"
    );


// ==========================================
// JARVIS VOICE
// ==========================================

function jarvisSpeak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.error(
            "Speech synthesis is not supported."
        );

        return;

    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        "en-US";

    speech.rate =
        0.95;

    speech.pitch =
        0.9;

    speech.volume =
        1;


    window.speechSynthesis.speak(
        speech
    );


    console.log(
        "JARVIS SPEAKING:",
        text
    );

}


// ==========================================
// INITIALIZATION
// ==========================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "JARVIS SYSTEM ONLINE"
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
// NAVIGATION
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
            event => {

                event.preventDefault();


                const targetScreen =
                    button.getAttribute(
                        "data-screen"
                    );


                console.log(
                    "Navigation:",
                    targetScreen
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


                if (!selectedScreen) {

                    console.error(
                        "Screen not found:",
                        targetScreen
                    );

                    return;

                }


                selectedScreen.classList.add(
                    "active-screen"
                );


                navigationButtons.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                // Close time panel when
                // leaving the tools page.

                if (
                    targetScreen !==
                    "toolsScreen"
                ) {

                    const timePanel =
                        document.getElementById(
                            "timePanel"
                        );

                    if (timePanel) {

                        timePanel.classList.remove(
                            "show"
                        );

                    }

                }

            }
        );

    }
);


// ==========================================
// TALK TO JARVIS
// ==========================================

if (talkButton) {

    talkButton.addEventListener(
        "click",
        async () => {

            console.log(
                "JARVIS BUTTON CLICKED"
            );


            // ----------------------------------
            // IMMEDIATE RESPONSE
            // ----------------------------------

            status.textContent =
                "JARVIS LISTENING...";


            const greeting =
                "Hello James. I am JARVIS.";


            response.textContent =
                greeting;


            // Speak immediately.
            jarvisSpeak(
                greeting
            );


            status.textContent =
                "JARVIS ACTIVE";


            // ----------------------------------
            // BACKEND IS SECONDARY
            // ----------------------------------

            if (!supabaseClient) {

                return;

            }


            try {

                const {
                    data: {
                        session
                    }
                } =
                    await supabaseClient
                        .auth
                        .getSession();


                if (!session) {

                    console.log(
                        "No Supabase session."
                    );

                    return;

                }


                /*
                 * Backend happens AFTER the
                 * immediate local response.
                 */

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

                            body:
                                JSON.stringify({

                                    action:
                                        "chat",

                                    message:
                                        "Hello Jarvis"

                                })

                        }
                    );


                if (!backendResponse.ok) {

                    console.error(
                        "Backend request failed."
                    );

                    return;

                }


                const data =
                    await backendResponse.json();


                console.log(
                    "Backend response:",
                    data
                );


                /*
                 * Only replace the local greeting
                 * if the backend actually gives
                 * us a reply.
                 */

                if (data.reply) {

                    response.textContent =
                        data.reply;


                    jarvisSpeak(
                        data.reply
                    );

                }


            } catch (error) {

                /*
                 * Backend failure must NEVER
                 * break local JARVIS.
                 */

                console.error(
                    "Backend error:",
                    error
                );

            }

        }
    );

}


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

        return JSON.parse(
            localStorage.getItem(
                "jarvisMemories"
            )
        ) || [];

    } catch (error) {

        console.error(
            "Memory read error:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE MEMORIES
// ==========================================

function saveMemoryArray(
    memories
) {

    localStorage.setItem(
        "jarvisMemories",
        JSON.stringify(
            memories
        )
    );

}


// ==========================================
// CREATE MEMORY BUTTON
// ==========================================

if (createMemoryButton) {

    createMemoryButton.addEventListener(
        "click",
        () => {

            editingMemoryIndex =
                null;


            memoryModalTitle.textContent =
                "NEW MEMORY";


            saveMemory.textContent =
                "SAVE MEMORY";


            memoryInput.value =
                "";


            memoryModal.classList.add(
                "show"
            );


            memoryInput.focus();

        }
    );

}


// ==========================================
// CANCEL MEMORY
// ==========================================

if (cancelMemory) {

    cancelMemory.addEventListener(
        "click",
        () => {

            memoryModal.classList.remove(
                "show"
            );


            editingMemoryIndex =
                null;

        }
    );

}


// ==========================================
// SAVE / EDIT MEMORY
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


            // ----------------------------------
            // EDIT EXISTING MEMORY
            // ----------------------------------

            if (
                editingMemoryIndex !== null
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


                memoryModal.classList.remove(
                    "show"
                );


                editingMemoryIndex =
                    null;


                loadMemories();


                response.textContent =
                    "Memory updated.";


                status.textContent =
                    "JARVIS ACTIVE";


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


            memoryModal.classList.remove(
                "show"
            );


            loadMemories();


            response.textContent =
                "Memory saved.";


            status.textContent =
                "JARVIS ACTIVE";


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


    /*
     * Remove ONLY memories created by
     * JavaScript.
     *
     * The original three cards remain.
     */

    document
        .querySelectorAll(
            ".saved-memory"
        )
        .forEach(
            card => {

                card.remove();

            }
        );


    const memories =
        getMemories();


    memories.forEach(
        (
            memory,
            index
        ) => {

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
// MEMORY EDIT / DELETE
// ==========================================

function attachMemoryActions() {


    // --------------------------------------
    // EDIT
    // --------------------------------------

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


                        if (!memories[index]) {
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


    // --------------------------------------
    // DELETE
    // --------------------------------------

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


                        response.textContent =
                            "Memory deleted.";


                        status.textContent =
                            "JARVIS ACTIVE";


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

                response.textContent =
                    "There are no saved memories.";


                jarvisSpeak(
                    "There are no saved memories to clear."
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


            response.textContent =
                "All memories cleared.";


            status.textContent =
                "JARVIS ACTIVE";


            jarvisSpeak(
                "All saved memories have been cleared."
            );

        }
    );

}


// ==========================================
// ESCAPE MEMORY TEXT
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
// TOOLS
// ==========================================

const toolCards =
    document.querySelectorAll(
        ".tool-card"
    );


const timePanel =
    document.getElementById(
        "timePanel"
    );


const closeTimeTool =
    document.getElementById(
        "closeTimeTool"
    );


const currentTime =
    document.getElementById(
        "currentTime"
    );


const currentDate =
    document.getElementById(
        "currentDate"
    );


const speakTimeButton =
    document.getElementById(
        "speakTimeButton"
    );


// ==========================
