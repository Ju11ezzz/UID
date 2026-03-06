const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (text) => ipcRenderer.invoke('save-file', text),
  newFile: () => ipcRenderer.invoke('new-file')
});