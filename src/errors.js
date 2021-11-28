class InvalidPersonId extends Error {
    constructor(ops) {
        super(ops);
        this.name = 'InvalidPersonId';
    }
}

class NotFoundError extends Error {
    constructor(ops) {
        super(ops);
        this.name = 'NotFoundError';
    }
}

class InvalidRequestError extends Error {
    constructor(ops) {
        super(ops);
        this.name = 'InvalidRequestError';
    }
}

module.exports = {
    InvalidPersonId,
    NotFoundError,
    InvalidRequestError
}