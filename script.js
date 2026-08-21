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


    window.speechSynthesis.speak(
        speech
    );


    console.log(
        "JARVIS SPEAKING:",
        text
    );
}


// ==========================================
// SPEECH WARMUP
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

        loadMemories();

        updateTime();

        setInterval(
            updateTime,
            1000
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
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );

            }
        );

    }
);


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

    return JSON.parse(
        localStorage.getItem(
            "jarvisMemories"
        )
    ) || [];

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
// CREATE MEMORY
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


            // EDIT EXISTING MEMORY
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


            // CREATE NEW MEMORY
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


            memoryContent.insertBefore(
                card,
                createButton
            );

        }
    );


    attachMemoryActions();

}


// ==========================================
// EDIT / DELETE MEMORY
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


const toolCards =
    document.querySelectorAll(
        ".tool-card"
    );


// ==========================================
// TOOL CARD CLICK
// ==========================================

toolCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                const tool =
                    card.getAttribute(
                        "data-tool"
                    );


                // TIME TOOL
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
// UPDATE DISPLAY TIME
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
// SPEAK TIME
// ==========================================

if (speakTimeButton) {

    speakTimeButton.addEventListener(
        "click",
        () => {

            const now =
                new Date();


            // ----------------------------------
            // MANUAL 12-HOUR CONVERSION
            // ----------------------------------

            let hour =
                now.getHours();


            const minute =
                now.getMinutes();


            const period =
                hour >= 12
                    ? "PM"
                    : "AM";


            // Convert 24-hour hour to 12-hour hour
            hour =
                hour % 12;


            // Midnight and noon handling
            if (hour === 0) {

                hour = 12;

            }


            const minuteText =
                minute
                    .toString()
                    .padStart(
                        2,
                        "0"
                    );


            const date =
                now.toLocaleDateString(
                    "en-NG",
    
