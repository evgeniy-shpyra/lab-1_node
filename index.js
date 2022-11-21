import router from './src/router.js'
import defaultHandler from './src/defaultHandler.js'
import * as http from 'node:http'
import helpers from './src/helpers.js'
import { safeJSON } from './src/utils.js'

const processedContentType = {
    'text/html': (text) => text,
    'text/plain': (text) => text,
    'application/json': (json) => safeJSON(json, {}),
    'application/x-www-form-urlencoded': (data) =>
        Object.fromEntries(new URLSearchParams(data)),
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const routerModule = router.get(url.pathname) ?? {}
    const handler = routerModule[req?.method] ?? defaultHandler

    let payload = {}
    let rawRequest = ''

    for await (const chuck of req) {
        rawRequest += chuck
    }

    if (req.headers['content-type']) {
        const contentType = req.headers['content-type'].split(';')[0]

        if (processedContentType[contentType]) {
            payload = processedContentType[contentType](rawRequest)
        }
    }
    try {
        handler(req, Object.assign(res, helpers), url, payload, rawRequest)
    } catch (e) {
        res.statusCode = 500
        req.end(process.env.NODE_ENV === 'production' ? 'internal error' : e)
    }
})

server.on('clientError', (err, socket) => {
    if (err) console.log(err)
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
