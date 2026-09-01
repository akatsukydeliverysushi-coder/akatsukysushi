const { app, BrowserWindow, shell, session, dialog } = require('electron');
const https = require('https');

const PANEL_URL = 'https://akatsukydeliverysushi-coder.github.io/akatsukysushi/painel.html';
const VERSION_URL = 'https://raw.githubusercontent.com/akatsukydeliverysushi-coder/akatsukysushi/main/desktop/version.json';

function checkForUpdate() {
  return new Promise((resolve) => {
    const request = https.get(VERSION_URL, { headers: { 'User-Agent': 'AkatsukyADM' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          if (res.statusCode !== 200) return resolve();
          const info = JSON.parse(data);
          if (info.version && info.version !== app.getVersion() && info.url) {
            const result = await dialog.showMessageBox({
              type: 'info',
              title: 'Atualização disponível',
              message: `Nova versão do Akatsuky ADM: ${info.version}`,
              detail: 'Deseja baixar a nova versão agora?',
              buttons: ['Atualizar', 'Depois'],
              defaultId: 0,
              cancelId: 1
            });
            if (result.response === 0) shell.openExternal(info.url);
          }
        } catch (_) {}
        resolve();
      });
    });
    request.setTimeout(5000, () => { request.destroy(); resolve(); });
    request.on('error', () => resolve());
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#08090c',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.once('ready-to-show', () => win.show());
  win.loadURL(PANEL_URL, { userAgent: `AkatsukyADM/${app.getVersion()}` });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(PANEL_URL) && !url.startsWith('https://akatsukydeliverysushi-coder.github.io/')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  await checkForUpdate();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
