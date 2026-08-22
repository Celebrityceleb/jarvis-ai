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

    console.log("SUPABASE CONNECTED");

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
// JARVIS VOICE
// ==========================================

function jarvisSpeak(text) {

    if (!("speechSynthesis" in window)) {

        console.error(
            "Speech synthesis is not supported."
        );

        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

    console.log(
        "JARVIS SPEAKING:",
        text
    );
}


// ==========================================
// PAGE LOAD
// ==========================================

window.addEventListener(
    "load",
    () => {

        // Warm up speech engine
        if ("speechSynthesis" in window) {

            const warmup =
                new SpeechSynthesisUtterance("");

            warmup.volume = 0;

            window.speechSynthesis.speak(
                warmup
            );
        }

        // Load saved memories
        loadMemories();

        // Start clock
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
                event.stopPropagation();

                const targetScreen =
                    this.getAttribute(
                        "data-screen"
                    );

                console.log(
                    "NAVIGATION:",
                    targetScreen
                );


                // Hide all screens
                screens.forEach(
                    screen => {

                        screen.classList.remove(
                            "active-screen"
                        );

                    }
                );


                // Find selected screen
                const selectedScreen =
                    document.getElementById(
                        targetScreen
                    );


                // Show selected screen
                if (selectedScreen) {

                    selectedScreen.classList.add(
                        "active-screen"
                    );

                } else {

                    console.error(
                        "SCREEN NOT FOUND:",
                        targetScreen
                    );

                }


                // Remove active state
                navigationButtons.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                // Activate selected button
                this.classList.add(
                    "active"
                );

            }
        );

    }
);


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


            status.textContent =
                "JARVIS ACTIVE";


            if (!supabaseClient) {
                return;
            }


            try {

                const {
                    data: { session }
                } =
                    await supabaseClient
                        .auth
                        .getSession();


                if (!session) {
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
                    "BACKEND RESPONSE:",
                    data
                );


                if (
                    backendResponse.ok &&
                    data.reply
                ) {

                    response.textContent =
                        data.reply;

                    jarvisSpeak(
                        data.reply
                    );

                }


            } catch (error) {

                console.error(
                    "JARVIS BACKEND ERROR:",
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
            "MEMORY READ ERROR:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE MEMORIES
// ==========================================

function saveMemoryArray(memories) {

    localStorage.setItem(
        "jarvisMemories",
        JSON.stringify(memories)
    );

}


// ==========================================
// CREATE MEMORY BUTTON
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
// CANCEL MEMORY
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
// SAVE / UPDATE MEMORY
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


            // EDIT
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


                response.textContent =
                    "Memory updated.";

                status.textContent =
                    "JARVIS ACTIVE";


                jarvisSpeak(
                    "Memory updated."
                );


                return;
            }


            // CREATE
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


    // Remove generated memories
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
// MEMORY EDIT / DELETE ACTIONS
// ==========================================

function attachMemoryActions() {


    // EDIT
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


    // DELETE
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


                        if (
                            !confirm(
                                "Delete this memory?"
                            )
                        ) {

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


            if (
                !confirm(
                    "Are you sure you want to delete all saved memories?"
                )
            ) {

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
// TIME TOOL
// ==========================================

const timeTool =
    document.getElementById(
        "timeTool"
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


// ==========================================
// TOOL CARDS
// ==========================================

const toolCards =
    document.querySelectorAll(
        ".tool-card"
    );


toolCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                const tool =
                    card.getAttribute(
                        "data-tool"
                    );


                // TIME
                if (tool === "time") {

                    openTimeTool();

                    return;

                }


                // OTHER TOOLS
                response.textContent =
                    `${tool.toUpperCase()} tool is coming online.`;

                status.textContent =
                    "JARVIS ACTIVE";


                jarvisSpeak(
                    `${tool} tool is not online yet.`
                );

            }
        );

    }
);


// ==========================================
// OPEN TIME TOOL
// ==========================================

function openTimeTool() {

    if (!timeTool) {
        return;
    }


    timeTool.classList.add(
        "show"
    );


    updateTime();

}


// ==========================================
// CLOSE TIME TOOL
// ==========================================

if (closeTimeTool) {

    closeTimeTool.addEventListener(
        "click",
        () => {

            timeTool.classList.remove(
                "show"
            );

        }
    );

}


// ==========================================
// UPDATE TIME DISPLAY
// ==========================================

function updateTime() {

    if (
        !currentTime ||
        !currentDate
    ) {

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
                year: "nume
