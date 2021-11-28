const axios = require('axios');
const cp = require('child_process');
const path = require('path');
require('dotenv').config();

const host = 'localhost';
const port = process.env.PORT || 3000;
const URL = `http://${host}:${port}`;

let serverProcess = null;

const spawnServer = async () => {
    return new Promise((resolve, reject) => {
        serverProcess = cp.spawn('node', [path.join(__dirname, 'server.js'), '--aaaa'],
            {stdio: ['pipe', 'pipe', 'pipe']});
        let data = '';
        serverProcess.stdout.on('data', d => {
            data += d;
            if (data.startsWith('Server is running on')) {
                data = '';
                resolve();
            }
            // process.stdout.write(d);
        });
        serverProcess.on('error', err => reject(err));
    });
};

beforeAll(async () => {
    await spawnServer();
});

afterAll(() => {
    serverProcess.kill();
});

jest.setTimeout(10000);

const testPerson = {"name":  "darina", "age": 21, "hobbies": ["hate people", "my dog"]};


describe('test bad person ids', () => {
    test('GET', () => {
        expect.assertions(2);
        return axios.get(`${URL}/person/kek`)
            .catch(err => {
                expect(err.response.status).toBe(400);
                expect(err.response.data.error).toBe('InvalidPersonId');
            });
    });

    test('PUT', () => {
        expect.assertions(2);
        return axios.put(`${URL}/person/kek`, {name: 'bad'})
            .catch(err => {
                expect(err.response.status).toBe(400);
                expect(err.response.data.error).toBe('InvalidPersonId');
            });
    });

    test('DELETE', () => {
        expect.assertions(2);
        return axios.delete(`${URL}/person/kek`)
            .catch(err => {
                expect(err.response.status).toBe(400);
                expect(err.response.data.error).toBe('InvalidPersonId');
            });
    });
});

describe('check create and update validations', () => {
    const inputBadData = {
        name: {name: 333},
        age: {age: 'keklol'},
        hobbies: {hobbies: [123, 'sss']}
    };

    for (const [name, inputData] of Object.entries(inputBadData)) {
        test(`create: bad ${name}`, () => {
            expect.assertions(2);
            return axios.post(`${URL}/person`, inputData)
                .catch(err => {
                    expect(err.response.status).toBe(400);
                    expect(err.response.data.error).toContain('InvalidRequestError')
                });
        });
    }

    // prepare some object to test UPDATE validation
    let personId = null;
    test('prepare object for update validation', async () => {
        const resp = await axios.post(`${URL}/person`, testPerson);
        personId = resp.data.id;
    });

    for (const [name, inputData] of Object.entries(inputBadData)) {
        test(`update: bad ${name}`, () => {
            expect.assertions(2);
            const update = Object.assign({}, testPerson, inputData); // test only one field at a time
            return axios.put(`${URL}/person/${personId}`, update)
                .catch(err => {
                    expect(err.response.status).toBe(400);
                    expect(err.response.data.error).toContain('InvalidRequestError')
                });
        });
    }
    test('clean-up test object', async () => {
        await axios.delete(`${URL}/person/${personId}`);
    });
});

describe('e2e tests', () => {


    test('e2e scenario from cross-check', () => {
        expect.assertions(19);
        let createdPerson = null;
        /* scenario:
        GET-запросом получаем все объекты (ожидается пустой массив)
        POST-запросом создается новый объект (ожидается ответ, содержащий свежесозданный объект)
        GET-запросом пытаемся получить созданный объект по его id (ожидается созданный объект)
        PUT-запросом пытаемся обновить созданный объект (ожидается ответ, содержащий обновленный объект с тем же id)
        DELETE-запросом удаляем созданный объект по id (ожидается подтверждение успешного удаления)
        GET-запросом пытаемся получить удаленный объект по id (ожидается ответ, что такого объекта нет)
         */
        return axios.get(`${URL}/person`)
            .then(r => {
                expect(r.status).toBe(200);
                return r.data;
            })
            .then(json => {
                expect(Array.isArray(json)).toBeTruthy();
                expect(json).toStrictEqual([]);
            })
            .then(() => {
                // POST create person
                return axios.post(`${URL}/person`, testPerson)
                    .then(r => {
                        expect(r.status).toBe(201);
                        return r.data;
                    })
                    .then(json => {
                        expect(typeof json).toBe('object');
                        expect(json.name).toBe(testPerson.name);
                        expect(json.age).toBe(testPerson.age);
                        expect(json.hobbies).toStrictEqual(testPerson.hobbies);
                        createdPerson = json;
                    })
            })
            .then(() => {
                return axios.get(`${URL}/person/${createdPerson.id}`)
                    .then(r => {
                        expect(r.status).toBe(200);
                        return r.data
                    })
                    .then(json => {
                        expect(json).toStrictEqual(createdPerson)
                    })
            })
            .then(() => {
                // PUT update object
                const updateObj = {name: 'new darina', age: 22, hobbies: ['cats', 'beer']};
                return axios.put(`${URL}/person/${createdPerson.id}`, updateObj)
                    .then(r => {
                        expect(r.status).toBe(200);
                        return r.data;
                    })
                    .then(json => {
                        expect(typeof json).toBe('object');
                        expect(json.id).toBe(createdPerson.id);
                        expect(json.name).toBe(updateObj.name);
                        expect(json.age).toBe(updateObj.age);
                        expect(json.hobbies).toStrictEqual(updateObj.hobbies);
                    })
            })
            .then(() => {
                // DELETE person
                return axios.delete(`${URL}/person/${createdPerson.id}`)
                    .then(r => {
                        expect(r.status).toBe(204)
                    })
            })
            .then(() => {
                // GET by id to check whether the person deleted
                return axios.get(`${URL}/person/${createdPerson.id}`)
                    .catch(err => {
                        expect(err.response.status).toBe(404);
                        expect(err.response.data.error).toBe('NotFoundError');
                    });
            });
    });


});