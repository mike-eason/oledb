# oledb.js

[![npm version](https://img.shields.io/badge/npm-v1.4.0-blue.svg)](https://www.npmjs.com/package/oledb)
[![license](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![tips](https://img.shields.io/badge/tips-bitcoin-brightgreen.svg)](https://www.coinbase.com/blahyourhamster)

A small **promise based** module which uses [Edge](https://github.com/tjanczuk/edge) to connect and execute queries for a 
[OLE DB](https://en.wikipedia.org/wiki/OLE_DB), [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) or [SQL](https://en.wikipedia.org/wiki/SQL) database.

## Example
```js
const connectionString = 'provider=vfpoledb;data source=C:/MyDatabase.dbc';

const oledb = require('oledb');
const db = oledb.oledbConnection(connectionString);

let command = 'select * from account';

db.query(command)
.then(results => {
    console.log(results[0]);
},
err => {
    console.error(err);
});
```

## Installation
```
npm install oledb --save
```

This module is a proxy that uses **ADO.NET** to call .NET code and therefore requires the **.NET Framework** to be installed.

## Options
The module exposes three functions to initialize database connections:

- `oledb.oledbConnection(connectionString)` - Initializes a connection to an **OLE DB** database.
- `oledb.odbcConnection(connectionString)` - Initializes a connection to an **ODBC** database.
- `oledb.sqlConnection(connectionString)` - Initializes a connection to an **SQL** database.

Here is an example:

```js
const connectionString = 'Server=myServerAddress;Database=myDataBase;Trusted_Connection=True;';

const oledb = require('oledb');
const db = oledb.oledbConnection(connectionString);

...
```

## Promises
There are 3 available promises that can be used to send commands and queries to a database connection:

- `.query(command, parameters)` - Executes a query and returns the result set returned by the query as an `Array`.
- `.execute(command, parameters)` - Executes a query command and returns the number of rows affected.
- `.scalar(command, parameters)` - Executes a query and returns the first column of the first row in the result set returned by the query. All other columns and rows are ignored.

Where `command` is the query string and `parameters` is an array of parameter values.

*Note: The `parameters` argument is **optional**.*

## Query Parameters
Parameters are also supported and use positional parameters that are marked with a question mark (?). Here is an example:

```js
let command = `
    update account
    set
        firstname = ?
    where
        id = ?
`;

let parameters = [ 'Bob', 69 ];

db.execute(command, parameters)
.then(rowsAffected => {
    console.log(rowsAffected);
},
err => {
    console.error(err);
});
```

## Multiple Data Sets
The `.query` promise has support for multiple data sets that can be returned in a single query. Here is an example:

```js
let command = `
    select * from account;
    select * from address;
`;

db.query(command)
.then(results => {
    console.log(results[0]); //1st data set
    console.log(results[1]); //2nd data set
},
err => {
    console.error(err);
});
```

## License
This project is licensed under [MIT](LICENSE).
