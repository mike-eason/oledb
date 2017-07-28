# oledb.js

[![npm version](https://img.shields.io/badge/npm-v1.5.0-blue.svg)](https://www.npmjs.com/package/oledb)
[![license](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![tips](https://img.shields.io/badge/tips-bitcoin-brightgreen.svg)](https://www.coinbase.com/blahyourhamster)

A small **promise based** module which uses [Edge](https://github.com/tjanczuk/edge) to connect and execute queries for a 
[OLE DB](https://en.wikipedia.org/wiki/OLE_DB), [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) or [SQL](https://en.wikipedia.org/wiki/SQL) database.

## Example
```js
const connectionString = 'provider=vfpoledb;data source=C:/MyDatabase.dbc';

const oledb = require('oledb');
const db = oledb.oledbConnection(connectionString);

let command = 'select * from account;';

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

---

## Promises
There are a number available promises that can be used to send commands and queries to a database connection:

- `.query(command, [parameters])` - Executes a query and returns the result set returned by the query as an `Array`.
- `.execute(command, [parameters])` - Executes a query command and returns the **number of rows affected**.
- `.scalar(command, [parameters])` - Executes a query and returns the first column of the first row in the result set returned by the query. All other columns and rows are ignored.
- `.procedure(command, [parameters], [returns])` - Excutes a stored procedure and returns the result, otherwise the return parameter value if defined.
- `.transaction(commands)` - Excutes an array of queries in a single transaction and returns the result of each.

Each parameter is described below:

- `command` - The string query command to be executed.
- `parameters` - An **Array** of parameter values. This is an **optional** parameter.
- `returns` - A return value object, see the *Stored Procedure* section below. This is an **optional** parameter.
- `commands` - A parameter used for transactions, see the *Transactions* section below.

## Query Parameters
Parameters are also supported and use positional parameters that are marked with a question mark (?). Here is an example:

```js
let command = `
    update account
    set
        firstname = ?
    where
        id = ?;
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

---

## Stored Procedures
Stored procedures can be executed using the `.procedure` function with optional parameters and return value. Here is an example:

```js
let procedureName = `addNumbers`;

let parameters = [1, 2];

db.procedure(procedureName, parameters)
.then(result => {
    console.log(result);
},
err => {
    console.error(err);
});
```

### Stored Procedure Return Values
You can use a return value parameter with the `.procedure` function. The parameter must look like this:

```js
{
    name: 'myParameter',    //String - Required
    value: 'hello world',   //Object - Optional
    precision: 0,           //Byte - Optional
    scale: 1,               //Byte - Optional
    size: 2                 //Byte - Optional
}
```

Here is an example:

```js
let procedureName = `addNumbers`;

let parameters = [1, 2];
let returns = {
    name: 'result',
    value: 0
};

db.procedure(procedureName, parameters, returns)
.then(result => {
    console.log(result);
},
err => {
    console.error(err);
});
```

---

## Transactions
The `.transaction` promise will execute multiple commands in a **single** transaction, this is useful for if you want to insert records across different tables
and need to ensure that they all are inserted successfully, or not at all. **All** query types are supported, including `procedure`. Here is an example:

```js
let commands = [
    {
        query: 'insert into account (name) values (?)',
        params: [ 'Bob' ]
    },
    {
        query: 'select * from account where name = ?',
        type: oledb.COMMAND_TYPES.QUERY,
        params: [ 'Bob' ]
    }
];

db.transaction(commands)
.then(results => {
    console.log(results[0].result); //Insert query result.
    console.log(results[1][0].result); //Select query result. (First result set)
},
err => {
    console.log(err);
});
```

*Note: The result field will contain an array of results if using a `query` command as multiple query results are supported by each executed query. See Multiple Data Sets above.*

All commands must follow the following structure:

```js
{
    query: string,      //The query string - Required
    params: Array,      //The query parameters - Optional
    type: string,       //The query type, use one of the oledb.COMMAND_TYPES enumerations. - Optional - Defaults to 'command'
    returns: Object     //The return parameter if applicable (see Stored Procedures). - Optional
}
```

## License
This project is licensed under [MIT](LICENSE).
