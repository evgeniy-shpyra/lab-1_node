import router from './router.js'
import defaultHandler from './defaultHandler.js'
import * as http from 'node:http'

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const routerModule = router.get(url.pathname) ?? {}
    const handler = routerModule[req?.method] ?? defaultHandler

    handler(req, res, url)
})

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 bad request\r\n\r\n')
})

server.listen(parseInt(process.env.PORT) || 8000)

process.on('SIGINT', () => {
    server.close((error) => {
        if (error) {
            console.log(error)
            process.exit(1)
        }
    })
})
