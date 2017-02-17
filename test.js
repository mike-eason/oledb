const tap = require('tap').test;
const oledb = require('./index');

const connectionString = 'mydatabase.dbc';

tap('fails if connection string is empty.', (t) => {
    t.throws(
        () => oledb(''),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if connection string is null.', (t) => {
    t.throws(
        () => oledb(null),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if connection string is undefined.', (t) => {
    t.throws(
        () => oledb(),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('does not fail if connection string is defined.', (t) => {
    t.doesNotThrow(
        () => oledb(connectionString),
        'Should not throw constring must not be null or empty');

    t.end();
});

tap('query fails if command is empty', (t) => {
    let db = oledb(connectionString);
    let command = '';

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('scalar fails if command is empty', (t) => {
    let db = oledb(connectionString);
    let command = '';

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('execute fails if command is empty', (t) => {
    let db = oledb(connectionString);
    let command = '';

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('query fails if command is null', (t) => {
    let db = oledb(connectionString);
    let command = null;

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('scalar fails if command is null', (t) => {
    let db = oledb(connectionString);
    let command = null;

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('execute fails if command is null', (t) => {
    let db = oledb(connectionString);
    let command = null;

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('query fails if command is undefined', (t) => {
    let db = oledb(connectionString);

    db.query()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('scalar fails if command is undefined', (t) => {
    let db = oledb(connectionString);

    db.scalar()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('execute fails if command is undefined', (t) => {
    let db = oledb(connectionString);

    db.execute()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});