const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,          // 🔥 ГОЛОВНЕ
        titleBarStyle: "hidden",
        webPreferences: {
            preload: __dirname + '/preload.js'
        }
});

    mainWindow.loadFile('index.html');

    // 🔥 ПРИБИРАЄМО МЕНЮ
    Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

// ===== IPC =====

ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
        filters: [{ name: 'Text Files', extensions: ['txt'] }],
        properties: ['openFile']
    });

    if (result.canceled) return null;

    const path = result.filePaths[0];
    const content = fs.readFileSync(path, 'utf-8');

    return { path, content };
});

ipcMain.handle('save-file', async (event, data) => {
    let filePath = data.path;

    if (!filePath) {
        const result = await dialog.showSaveDialog({
            filters: [{ name: 'Text Files', extensions: ['txt'] }]
        });

        if (result.canceled) return null;
        filePath = result.filePath;
    }

    fs.writeFileSync(filePath, data.content);
    return filePath;
});