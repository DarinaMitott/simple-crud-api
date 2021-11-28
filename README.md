# simple-crud-api

### Installation steps

1. Clone the repo, checkout the branch
```bash
git clone https://github.com/DarinaMitott/simple-crud-api
git checkout simple_crud_api_feature
```

2. Navigate to the cloned repo and Install require packages
```bash
cd simple-crud-api
npm install 
```

### How to use

There are two ways to run the server:
* Production mode
```
npm run start:prod
```

* Development mode
```bash
npm run start:dev 
```

### Tests

To run tests just do the following command:
```bash
npm run test
```

### API Description

API path `/person`:
    * **GET** `/person` or `/person/${personId}` should return all persons or person with corresponding `personId`
    * **POST** `/person` is used to create record about new person and store it in database
    * **PUT** `/person/${personId}` is used to update record about existing person
    * **DELETE** `/person/${personId}` is used to delete record about existing person from database

The Person object has the following properties:
    * `id` — unique identifier (`string`, `uuid`) generated on server side
    * `name` — person's name (`string`, **required**)
    * `age` — person's age (`number`, **required**)
    * `hobbies` — person's hobbies (`array` of `strings` or empty `array`, **required**)
