const {NotFoundError} = require("./errors");

class Database {
    constructor(initialPersons) {
        this._persons = initialPersons || [];
    }

    static create() {
        return new Database();
    }

    persons() {
        return this._persons;
    }

    findPersonOrThrow(personId) {
        const personIndex = this._persons.findIndex(item => item.id === personId);
        if (personIndex < 0) {
            throw new NotFoundError();
        }

        return this._persons[personIndex];
    }

    addNewPerson(person) {
        this._persons.push(person);
    }

    deletePersonOrThrow(personId) {
        const index = this._persons.findIndex(x => x.id === personId);
        if (index < 0) {
            throw new NotFoundError();
        }
        this._persons.splice(index, 1);
    }
}


module.exports = Database;