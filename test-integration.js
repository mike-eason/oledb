/*
    This file contains tests that will call the actual implementation of the ADO.NET database connection logic.

    Note that your system must have an instance of SQL Server running in order to run these tests as it will
    execute queries on a real database in order to test the Data.cs database connection class.

    Run the SQL script scripts/db-setup.sql before running these tests.
*/

const oledb = require('./index');
const tap = require('tap').test;

const connectionString = `Server=localhost\\SQLEXPRESS;Database=oledb-test;Trusted_Connection=True;`;

tap('runs a query', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = 'select * from dbo.CUSTOMER';

    db.query(command)
    .then(res => {
        t.ok(res);
        t.end();
    })
    .catch(err => {
        t.fail(err);
    });
});

tap('runs a query with a parameter', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = 'select * from dbo.CUSTOMER where Name = @p1';
    let parameters = ['Test User'];

    db.query(command, parameters)
    .then(res => {
        t.ok(res.result);
        t.equal(res.result.length, 1);
        t.end();
    })
    .catch(err => {
        t.fail(err);
    });
});

tap('runs a scalar query with a parameter', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = 'select Age from dbo.CUSTOMER where Name = @p1';
    let parameters = ['Test User'];

    db.scalar(command, parameters)
    .then(res => {
        t.ok(res.result);
        t.equal(res.result, 99);
        t.end();
    })
    .catch(err => {
        t.fail(err);
    });
});

tap('runs a command query with a parameter', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = 'update dbo.CUSTOMER set Age = 100 where Name = @p1';
    let parameters = ['Test User'];

    db.execute(command, parameters)
    .then(res => {
        t.ok(res.result);

        // Change the age back because I'm lazy.
        command = 'update dbo.CUSTOMER set Age = 99 where Name = @p1';
        
        return db.execute(command, parameters);
    })
    .then(res => {
        t.ok(res.result);
        t.end();
    })
    .catch(err => {
        t.fail(err);
    });
});

tap('runs a stored procedure with parameters', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = 'dbo.InsertCustomer';
    let parameters = [
        {
            name: 'Name',
            value: uuidv4()
        },
        {
            name: 'Age',
            value: 1000
        },
        {
            name: 'House',
            value: 'Test'
        },
        {
            name: 'Street',
            value: 'Test'
        },
        {
            name: 'County',
            value: 'Test'
        },
        {
            name: 'Country',
            value: null
        },
    ];

    db.procedure(command, parameters)
    .then(res => {
        t.equal(res.result, -1);

        command = 'select * from dbo.CUSTOMER where Name = @p1';
        parameters = [parameters[0].value];

        return db.query(command, parameters);
    })
    .then(res => {
        t.ok(res.result);
        t.equal(res.result.length, 1);
        t.end();
    })
    .catch(err => {
        t.fail(err);
    });
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
