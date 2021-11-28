class Route {
    constructor(method, pathRegex, handler) {
        this.method = method;
        this.pathRegex = pathRegex;
        this.handler = handler;
    }

    static get(pathRegex, handler) {
        return new Route('GET', pathRegex, handler);
    }

    static post(pathRegex, handler) {
        return new Route('POST', pathRegex, handler);
    }

    static put(pathRegex, handler) {
        return new Route('PUT', pathRegex, handler);
    }

    static delete(pathRegex, handler) {
        return new Route('DELETE', pathRegex, handler);
    }

    match(req) {
        const url = req.url.endsWith('/') ? req.url.slice(-1) : req.url;
        return req.method === this.method && this.pathRegex.test(url);
    }

    handleRequest(req, res, json) {
        const [status, response] = this.handler(req, json);
        res.writeHead(status, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(response));
    }
}

module.exports = Route;
