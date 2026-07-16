'use strict';

import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';

const webOptions = {
  width: 900,
  height: 600,
  minWidth: 900,
  minHeight: 600,
  backgroundColor: '#031A6E',
  show: false,
  icon: path.join(__dirname, '../../assets/electron.png'),
  webPreferences: {
    devTools: false,
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true,
  }
}

const title = 'NTC-EDGE APP';
const message = 'Something is temporarily wrong with your network connection. Please make sure you are connected to the internet. \n\nDo you want to try forcefully reloading the app?';
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const browserWindow = new BrowserWindow(webOptions);
  //catch network error status
  browserWindow.webContents.on('did-fail-load', async (event= Event, errorCode= number, errorDescription= string, validatedURL= string, isMainFrame= boolean) => {
    if (errorDescription === 'ERR_INTERNET_DISCONNECTED' || errorDescription === 'ERR_PROXY_CONNECTION_FAILED') {
      const { response } = await dialog.showMessageBox(browserWindow, {
        title,
        message,
        buttons: ['Reload', 'Close'],
        cancelId: 1,
        type: 'question',
      })
      if (response === 0) {
        browserWindow.reload();
      } else if (response === 1) {
        browserWindow.close();
      }
    }
  });

  browserWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
    event.preventDefault()
    const win = new BrowserWindow({
      ...webOptions,
      webContents: options.webContents, // use existing webContents if provided
      show: false
    })
    //catch network error status
    win.webContents.on('did-fail-load', async (event= Event, errorCode= number, errorDescription= string, validatedURL= string, isMainFrame= boolean) => {
      if (errorDescription === 'ERR_INTERNET_DISCONNECTED' || errorDescription === 'ERR_PROXY_CONNECTION_FAILED') {
        const { response } = await dialog.showMessageBox(win, {
          title,
          message,
          buttons: ['Reload', 'Close'],
          cancelId: 1,
          type: 'question',
        })
        if (response === 0) {
          win.reload();
        } else if (response === 1) {
          win.close();
        }
      }
    });

    win.once('ready-to-show', () => win.show())
    
    if (!options.webContents) {
      const loadOptions = {
        httpReferrer: referrer
      }
      if (postBody != null) {
        const { data, contentType, boundary } = postBody
        loadOptions.postData = postBody.data
        loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
      }

      win.loadURL(url, loadOptions);
    }
    event.newGuest = win
  })

  browserWindow.loadURL('https://www.app.ntcedge.com/');
  
  browserWindow.on('closed', () => {
    mainWindow = null;
  });

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  return browserWindow;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});
