const uuid = require("uuid");
const Database = require("./db");
const {InvalidPersonId, InvalidRequestError} = require("./errors");
const Route = require('./route');

let database = Database.create();


const VALIDATION_RULES = {
    name: x => typeof x === 'string' && x.trim(),
    age: x => typeof x === 'number' && x >= 0,
    hobbies: x => Array.isArray(x) && x.reduce((old, y) => old && typeof y === 'string', true)
}

const getAllPersons = () => {
    return [200, database.persons()];
};

const getPersonIdFromUrlOrThrow = (url) => {
    const chunks = url.slice(1).split('/').slice(1).filter(x => x.trim());
    if (chunks.length !== 1 || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(chunks[0])) {
        throw new InvalidPersonId();
    }
    return chunks[0];
}

const getPersonById = (req) => {
    const personId = getPersonIdFromUrlOrThrow(req.url);
    const person = database.findPersonOrThrow(personId);

    return [200, person];
};

const createPerson = (req, json) => {
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
        id: uuid.v4(),
        name: json.name,
        age: json.age,
        hobbies: json.hobbies
    };
    database.addNewPerson(person);

    return [201, person];
}

const updatePersonById = (req, json) => {
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

    return [200, person];
}

const deletePersonById = (req) => {
    const personId = getPersonIdFromUrlOrThrow(req.url);
    database.deletePersonOrThrow(personId);

    return [204, {'message': 'removed'}];
}


const routes = [
    Route.get(/^\/person\/?$/, getAllPersons),
    Route.get(/^\/person\/([^\/]+)$/, getPersonById),
    Route.post(/^\/person\/?$/, createPerson),
    Route.put(/^\/person\/([^\/]+)$/, updatePersonById),
    Route.delete(/^\/person\/([^\/]+)$/, deletePersonById),
];

module.exports = {
    routes,
}