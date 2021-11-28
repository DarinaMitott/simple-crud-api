const http = require('http');
require('dotenv').config();

const host = 'localhost';
const port = process.env.PORT || 3000;
const URL = `http://${host}:${port}`;


describe('tests', () => {

    const testPerson = {"name":  "darina", "age": 21, "hobbies": ["hate people", "my dog"]};

    test('create', () => {
        expect.assertions(7);
        const req = http.request(`${URL}/person`, {method: 'POST'}, res => {
            expect(res.statusCode).toBe(201);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                expect(typeof json).toBe('object');
                expect(json.name).toBe(testPerson.name);
                expect(json.age).toBe(testPerson.age);
                expect(json.hobbies).toStrictEqual(testPerson.hobbies);

                http.get(`${URL}/person/${json.id}`, res2 => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => {
                        const json2 = JSON.parse(data2);
                        expect(json2.id).toBe(json.id);
                        expect(json2).toStrictEqual(json);
                    });
                });
            });
        });
        req.setHeader('Content-Type', 'application/json');
        req.end(JSON.stringify(testPerson));

    });

});