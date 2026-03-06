let currentFilePath = null;
let isModified = false;

const editor = document.getElementById("editor");
const stats = document.getElementById("stats");
const statusText = document.getElementById("statusText");
const windowTitle = document.getElementById("windowTitle");
const saveModal = document.getElementById("saveModal");
const welcomeScreen = document.getElementById("welcomeScreen");

// Прив'язка кнопок
document.getElementById('btnNew').onclick = newFile;
document.getElementById('btnOpen').onclick = openFile;
document.getElementById('btnSave').onclick = saveFile;
document.getElementById('btnExit').onclick = exitApp;

function showEditor() {
    welcomeScreen.style.display = "none";
    editor.classList.add("visible-editor");
}

function updateStats() {
    const text = editor.value;
    const lines = text.split("\n").length;
    stats.textContent = `Символів: ${text.length} | Рядків: ${lines}`;
}

function updateTitle() {
    let name = currentFilePath ? currentFilePath.split(/[\\/]/).pop() : "Новий файл";
    if (isModified) name += " *";
    windowTitle.textContent = name;
}

function showSaveModal(callback) {
    saveModal.style.display = "block";
    document.getElementById("yesBtn").onclick = () => { saveModal.style.display = "none"; callback("yes"); }
    document.getElementById("noBtn").onclick = () => { saveModal.style.display = "none"; callback("no"); }
    document.getElementById("cancelBtn").onclick = () => { saveModal.style.display = "none"; callback("cancel"); }
}

editor.addEventListener("input", () => {
    isModified = true;
    updateStats();
    updateTitle();
    statusText.textContent = "Редагування...";
});

async function saveFile() {
    const result = await window.api.saveFile({
        path: currentFilePath,
        content: editor.value
    });
    if (result) {
        currentFilePath = result;
        isModified = false;
        updateTitle();
        statusText.textContent = "Файл збережено";
    }
}

function clearEditor() {
    showEditor();
    editor.value = "";
    currentFilePath = null;
    isModified = false;
    updateStats();
    updateTitle();
    statusText.textContent = "Створено новий файл";
}

async function doOpenFile() {
    const result = await window.api.openFile();
    if (result) {
        showEditor();
        currentFilePath = result.path;
        editor.value = result.content;
        isModified = false;
        updateStats();
        updateTitle();
        statusText.textContent = "Файл відкрито";
    }
}

async function newFile() {
    if (isModified) {
        showSaveModal(async (choice) => {
            if (choice === "yes") { await saveFile(); clearEditor(); }
            else if (choice === "no") { clearEditor(); }
        });
    } else { clearEditor(); }
}

async function openFile() {
    if (isModified) {
        showSaveModal(async (choice) => {
            if (choice === "yes") { await saveFile(); await doOpenFile(); }
            else if (choice === "no") { await doOpenFile(); }
        });
    } else { await doOpenFile(); }
}

function exitApp() {
    if (!isModified) { window.close(); return; }
    showSaveModal(async (choice) => {
        if (choice === "yes") { await saveFile(); window.close(); }
        else if (choice === "no") { window.close(); }
    });
}