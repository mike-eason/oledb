# oledb.js

[![npm version](https://img.shields.io/badge/npm-v1.5.2-blue.svg)](https://www.npmjs.com/package/oledb)
[![license](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![tips](https://img.shields.io/badge/tips-bitcoin-brightgreen.svg)](https://www.coinbase.com/blahyourhamster)

A small **promise based** module which uses [Edge-JS](https://github.com/agracio/edge-js) to connect and execute queries for a 
[OLE DB](https://en.wikipedia.org/wiki/OLE_DB), [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) or [SQL](https://en.wikipedia.org/wiki/SQL) database.

## Example
```js
const connectionString = '...';

const oledb = require('oledb');
const db = oledb.oledbConnection(connectionString);

let command = 'select * from account;';

db.query(command)
.then(result => {
    console.log(result);
},
err => {
    console.error(err);
});
```

The result will look like this:
```js
{
    query: 'select count(*) from account where name = @p1',
    type: 'query',
    params: [
        {
            name: 'p1',
            value: 'Mike',
            direction: 0,
            isNullable: false,
            precision: null,
            scale: null,
            size: null
        }
    ],
    'result': [
        [
            {
                id: 1,
                name: 'Bob'
            }
        ]
    ]
}
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

## Promises
There are a number available promises that can be used to send commands and queries to a database connection:

- `.query(command, [parameters])` - Executes a query and returns an is the result set returned by the query as an `Array`.
- `.execute(command, [parameters])` - Executes a query command and returns an is the the **number of rows affected**.
- `.scalar(command, [parameters])` - Executes a query and returns an is the first column of the first row in the result set returned by the query. All other columns and rows are ignored.
- `.procedure(command, [parameters])` - Excutes a stored procedure and returns the number of rows affected.
- `.procedureScalar(command, [parameters])` - Excutes a stored procedure and returns the result.
- `.transaction(commands)` - Excutes an array of commands in a single transaction and returns the result of each.

Each parameter is described below:

- `command` - The string query command to be executed.
- `parameters` - An **Array** of parameter values. This is an **optional** parameter.
- `commands` - A parameter used for transactions, see the *Transactions* section below.

## Query Parameters
Parameters are also supported and use positional parameters that are marked with a question mark (?) **OR** named parameters, i.e `@parameter1`. Here is an example:

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

### Query Parameter Options
There are a number of additional options for query parameters, a query parameter can either be a **single value** or an object:

```js
let parameters = [
    'Bob',  //Declare a single parameter value. Defaults to: { name: '@p1', value: 'Bob' }
    //Or use an object to specify additional options...
    {
        name: 'myParameter',    //OPTIONAL - Parameter name. Defaults to index based parameter names, i.e @p1, @p2, @p3 ect. Note that the @ symbols are optional.
        value: 123,             //OPTIONAL - Defaults to null.
        direction: string,      //OPTIONAL - The parameter direction, (Input, Input/Output, Output, Return Value). See oledb.PARAMETER_DIRECTIONS enum.
        isNullable: bool,       //OPTIONAL - Whether to treat the paramter as non-nullable.
        precision: byte,        //OPTIONAL - The precision of the parameter value in bytes.
        scale: byte,            //OPTIONAL - The scale of the parameter value in bytes.
        size: byte              //OPTIONAL - The size of the parameter value in bytes.
    }
];
```

---

## Multiple Data Sets
The `.query` promise has support for multiple data sets that can be returned in a single query. Here is an example:

```js
let command = `
    select * from account;
    select * from address;
`;

db.query(command)
.then(results => {
    console.log(results[0]); //1st query result
    console.log(results[1]); //2nd query result
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
You can use a return value or output parameter with the `.procedure` function. The parameter might look like this:

```js
{
    name: 'sum',
    direction: oledb.PARAMETER_DIRECTIONS.OUTPUT
}
```

*for more options, see **Query Parameter Options** section.*

Here is an example:

```js
let procedureName = `addNumbers`;

let parameters = [
    {
        name: 'num1',
        value: 1
    },
    {
        name: 'num2',
        value: 2
    },
    {
        name: 'sum',
        direction: oledb.PARAMETER_DIRECTIONS.OUTPUT
    }
];

db.procedure(procedureName, parameters)
.then(result => {
    console.log(result);
    console.log(result.params[2].value);    //The output value returned by addNumbers stored procedure.
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
    console.log(results); //An array of query results.
},
err => {
    console.log(err);
});
```

*Note: The result field will contain an array of results if using a `query` command as multiple query results are supported by each executed query. See Multiple Data Sets above.*

All commands must follow the following structure:

```js
{
    query: string,      //REQUIRED - The query string
    params: Array,      //OPTIONAL - The query parameters
    type: string        //OPTIONAL - The query type, use one of the oledb.COMMAND_TYPES enumerations. Defaults to 'command'.
}
```

### $prev Parameter
With **transactions**, you can use the special `'$prev'` parameter to inject the **previous** command's result into the **next** executing query. For example:

```js
let commands = [
    //First query, executes a stored procedure and returns an account id.
    {
        query: 'insert_account (@name)',
        params: [ 
            {
                name: 'name',
                value: 'Bob'
            },
            {
                name: 'accountId',
                direction: oledb.PARAMETER_DIRECTIONS.RETURN_VALUE
            }
        ],
        type: oledb.COMMAND_TYPES.PROCEDURE
    },
    //Second query, executes a select query with the returned value from the previous query.
    {
        query: 'select * from account where id = @accountId',
        type: oledb.COMMAND_TYPES.QUERY,
        params: [
            {
                name: 'accountId',
                value: '$prev'      //Note: This value must be a string.
            }
        ]
    }
];

db.transaction(commands)
.then(results => {
    console.log(results[0]); //Insert stored procedure result. Returns the ID of the account.
    console.log(results[1]); //Select query result. Returns the account 'Bob' record.
},
err => {
    console.log(err);
});
```

## License
This project is licensed under [MIT](LICENSE).
