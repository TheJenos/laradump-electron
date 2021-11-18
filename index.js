const { app, BrowserWindow, protocol } = require('electron')
const Store = require('electron-store');
const url = require('url')
const path = require('path')
const { LiveServer } = require('laradump-server')
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
   win.on('closed', () => {
      server.stopServer()
   })
   server.startServer()
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