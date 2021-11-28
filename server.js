const http = require('http');
const { routes } = require('./src/api');
const { InvalidPersonId, NotFoundError, InvalidRequestError } = require('./src/errors');

require('dotenv').config();

const host = 'localhost';
const port = process.env.PORT || 3000;


const makeResponse = (res, status, data) => {
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
}


const requestListener = function (req, res) {
    // console.log(`requested: ${req.url}, method: ${req.method}`);
    let buffers = [];
    req.on('data', chunk => buffers.push(chunk));
    req.on('end', () => {
        const json = req.headers['content-type'] === 'application/json' ? JSON.parse(Buffer.concat(buffers).toString()) : null;
        try {
            for (const route of routes) {
                if (route.match(req)) {
                    return route.handleRequest(req, res, json);
                }
            }
        } catch (e) {
            let status = 500;
            if (e instanceof InvalidPersonId || e instanceof InvalidRequestError) {
                status = 400;
            } else if (e instanceof NotFoundError) {
                status = 404;
            }
            makeResponse(res, status, {'error': e.toString()});
        }
    })
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
