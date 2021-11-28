const http = require('http');
const { v4 } = require('uuid');
const Database = require('./src/db');
const { InvalidPersonId, NotFoundError, InvalidRequestError } = require('./src/errors');

require('dotenv').config();

const host = 'localhost';
const port = process.env.PORT || 3000;

let database = Database.create();


const VALIDATION_RULES = {
    name: x => typeof x === 'string' && x.trim(),
    age: x => typeof x === 'number' && x >= 0,
    hobbies: x => Array.isArray(x) && x.reduce((old, y) => old && typeof y === 'string', true)
}

const makeResponse = (res, status, data) => {
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
}


const getAllPersons = (req, res) => {
    makeResponse(res, 200, database.persons());
};

const getPersonIdFromUrlOrThrow = (url) => {
    const chunks = url.slice(1).split('/').slice(1).filter(x => x.trim());
    if (chunks.length !== 1 || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(chunks[0])) {
        throw new InvalidPersonId();
    }
    return chunks[0];
}

const getPersonById = (req, res) => {
    const personId = getPersonIdFromUrlOrThrow(req.url);
    const person = database.findPersonOrThrow(personId);

    makeResponse(res, 200, person);
};

const createPerson = (req, res, json) => {
    if (!json) {
        throw new InvalidRequestError();
    }
    // validation
    for (const [name, validator] of Object.entries(VALIDATION_RULES)) {
        const val = json[name];
        if (!validator(val)) {
            throw new InvalidRequestError(`field "${name}" has invalid type`);
        }
    }

    const person = {
        id: v4(),
        name: json.name,
        age: json.age,
        hobbies: json.hobbies
    };
    database.addNewPerson(person);

    makeResponse(res, 201, person);
}

const updatePersonById = (req, res, json) => {
    const personId = getPersonIdFromUrlOrThrow(req.url);
    let person = database.findPersonOrThrow(personId);

    if (!json) {
        throw new InvalidRequestError();
    }

    for (const [name, validator] of Object.entries(VALIDATION_RULES)) {
        const val = json[name];
        if (!validator(val)) {
            throw new InvalidRequestError(`field "${name}" has invalid type`);
        }
        person[name] = val;
    }

    makeResponse(res, 200, person);
}

const deletePersonById = (req, res) => {
    const personId = getPersonIdFromUrlOrThrow(req.url);
    database.deletePersonOrThrow(personId);

    makeResponse(res, 204, {'message': 'removed'});
}

const requestListener = function (req, res) {
    console.log(`requested: ${req.url}, method: ${req.method}`);
    let buffers = [];
    req.on('data', chunk => buffers.push(chunk));
    req.on('end', () => {
        const json = req.headers['content-type'] === 'application/json' ? JSON.parse(Buffer.concat(buffers).toString()) : null;
        try {
            switch (true) {
                case req.url === '/person' && req.method === 'GET':
                    return getAllPersons(req, res);

                case req.url.startsWith('/person/') && req.method === 'GET':
                    return getPersonById(req, res);

                case req.url.startsWith('/person') && req.method === 'POST':
                    return createPerson(req, res, json);

                case req.url.startsWith('/person/') && req.method === 'PUT':
                    return updatePersonById(req, res, json);

                case req.url.startsWith('/person/') && req.method === 'DELETE':
                    return deletePersonById(req, res);

                default:
                    makeResponse(res, 404, {'error': 'Requested URL not found'});
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
