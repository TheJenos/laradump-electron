const { LiveServer } = require('laradump-server')
const server = new LiveServer()

server.stopServer()
server.startServer()