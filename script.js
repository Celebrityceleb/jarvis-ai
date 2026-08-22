// ==========================================
// JARVIS — STABLE MAIN SCRIPT
// CHECKPOINT 1
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
// SAFE RESPONSE UPDATE
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

    } catch (error) {

        console.error(
            "JARVIS VOICE ERROR:",
            error
        );

    }

}


// ==========================================
// INITIALIZATION
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

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
            function(event) {

                event.preventDefault();


                const target =
                    this.getAttribute(
                        "data-screen"
                    );


                console.log(
                    "JARVIS NAVIGATION:",
                    target
                );


                if (!target) {
                    return;
                }


                // ------------------------------
                // HIDE ALL SCREENS
                // ------------------------------

                screens.forEach(
                    screen => {

                        screen.classList.remove(
                            "active-screen"
                        );

                    }
                );


                // ------------------------------
                // SHOW TARGET SCREEN
                // ------------------------------

                const selectedScreen =
                    document.getElementById(
                        target
                    );


                if (!selectedScreen) {

                    console.error(
                        "JARVIS: Screen not found:",
                        target
                    );

                    return;

                }


                selectedScreen.classList.add(
                    "active-screen"
                );


                // ------------------------------
                // UPDATE NAVIGATION
                // ------------------------------

                navigationButtons.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                // ------------------------------
                // UPDATE TIME WHEN TOOLS OPENS
                // ------------------------------

                if (
                    target === "toolsScreen"
                ) {

                    updateTime();

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
                "JARVIS: Talk button pressed."
            );


            // ----------------------------------
            // IMMEDIATE RESPONSE
            // ----------------------------------

            setStatus(
                "JARVIS ACTIVE"
            );


            const greeting =
                "Hello James. I am JARVIS.";


            setResponse(
                greeting
            );


            // Speak immediately.
            // Backend is deliberately NOT waited for.
            jarvisSpeak(
                greeting
            );


            // ----------------------------------
            // BACKEND WORK HAPPENS AFTERWARD
            // ----------------------------------

            if (!supabaseClient) {

                console.log(
                    "JARVIS: Backend unavailable. Using local response."
                );

                return;

            }


            try {

                const sessionResult =
                    await supabaseClient
                        .auth
                        .getSession();


                const session =
                    sessionResult &&
                    sessionResult.data
                        ? sessionResult.data.session
                        : null;


                if (!session) {

                    console.log(
                        "JARVIS: No login session. Local response remains active."
                    );

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

                    console.warn(
                        "JARVIS backend returned:",
                        backendResponse.status
                    );

                    return;

                }


                const data =
                    await backendResponse.json();


                if (
                    data &&
                    data.reply
                ) {

                    setResponse(
                        data.reply
                    );


                    jarvisSpeak(
                        data.reply
                    );

                }

            } catch (error) {

                console.error(
                    "JARVIS BACKEND ERROR:",
                    error
                );

                // IMPORTANT:
                // Do not replace the working
                // immediate response with an error.

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

        const stored =
            localStorage.getItem(
                "jarvisMemories"
            );


        if (!stored) {
            return [];
        }


        const memories =
            JSON.parse(
                stored
            );


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

function saveMemoryArray(
    memories
) {

    try {

        localStorage.setItem(
            "jarvisMemories",
            JSON.stringify(
                memories
            )
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
// OPEN NEW MEMORY
// ==========================================

if (createMemoryButton) {

    createMemoryButton.addEventListener(
        "click",
        () => {

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
                    () => {
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
        () => {

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
        () => {

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


    // Remove dynamically generated memories.
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
                    ${escapeMemoryText(memory.text)}
                </div>

                <div class="memory-date">
                    ${escapeMemoryText(memory.date || "")}
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


                        if (
                            !memories[index]
                        ) {

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
                                () => {
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
     
