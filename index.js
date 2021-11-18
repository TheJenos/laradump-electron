const { app, BrowserWindow, protocol } = require('electron')
const Store = require('electron-store');
const url = require('url')
const path = require('path')
const { LiveServer } = require('laradump-server');
const { log } = require('console');
const server = new LiveServer()
const store = new Store();

let win

function createWindow() {
   win = new BrowserWindow({ width: 800, height: 600 })
   win.loadURL(url.format({
      pathname: '/index.html',
      protocol: 'file:',
      slashes: true
   }))
   win.setMenuBarVisibility(false)
   server.startServer()
   win.webContents.on('dom-ready', () => {
      win.webContents.executeJavaScript('window.darkTheme=' + store.get('darkTheme'));
      win.webContents.executeJavaScript('window.editor="' + store.get('editor') + '"');
   });
   win.webContents.on('did-finish-load', () => {
      setInterval(async () => {
         try {
            const darkTheme = (await win.webContents.executeJavaScript('window.darkTheme')) || false
            store.set('darkTheme', darkTheme)
            const editor = (await win.webContents.executeJavaScript('window.editor')) || 'vscode'
            store.set('editor', editor)
         } catch (error) { }
      }, 100);
   });
   win.on('closed', () => {
      server.stopServer()
   })
}

// app.on('ready', createWindow)

app.on('ready', () => {
   protocol.interceptFileProtocol('file', (request, callback) => {
      const url = request.url.substr(7)    /* all urls start with 'file://' */
      callback({ path: path.normalize(`${__dirname}/app/${url}`) })
   }, (err) => {
      if (err) console.error('Failed to register protocol')
   })
   createWindow()
})