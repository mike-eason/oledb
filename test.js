const tap = require('tap').test;
const oledb = require('./index');

const connectionString = 'mydatabase.dbc';

tap('fails if oledb connection string is empty.', (t) => {
    t.throws(
        () => oledb.oledbConnection(''),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if odbc connection string is empty.', (t) => {
    t.throws(
        () => oledb.odbcConnection(''),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if sql connection string is empty.', (t) => {
    t.throws(
        () => oledb.sqlConnection(''),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if oledb connection string is null.', (t) => {
    t.throws(
        () => oledb.oledbConnection(null),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if odbc connection string is null.', (t) => {
    t.throws(
        () => oledb.odbcConnection(null),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('fails if sql connection string is null.', (t) => {
    t.throws(
        () => oledb.sqlConnection(null),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('oledb fails if connection string is undefined.', (t) => {
    t.throws(
        () => oledb.oledbConnection(),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('odbc fails if connection string is undefined.', (t) => {
    t.throws(
        () => oledb.odbcConnection(),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('sql fails if connection string is undefined.', (t) => {
    t.throws(
        () => oledb.sqlConnection(),
        {},
        'Should throw constring must not be null or empty');

    t.end();
});

tap('does not fail if oledb connection string is defined.', (t) => {
    t.doesNotThrow(
        () => oledb.oledbConnection(connectionString),
        'Should not throw constring must not be null or empty');

    t.end();
});

tap('does not fail if odbc connection string is defined.', (t) => {
    t.doesNotThrow(
        () => oledb.odbcConnection(connectionString),
        'Should not throw constring must not be null or empty');

    t.end();
});

tap('does not fail if sql connection string is defined.', (t) => {
    t.doesNotThrow(
        () => oledb.sqlConnection(connectionString),
        'Should not throw constring must not be null or empty');

    t.end();
});

tap('oledb connection string must match', (t) => {
    let db = oledb.oledbConnection(connectionString);
    t.equal(db.connectionString, connectionString);
    t.end();
});

tap('odbc connection string must match', (t) => {
    let db = oledb.odbcConnection(connectionString);
    t.equal(db.connectionString, connectionString);
    t.end();
});

tap('sql connection string must match', (t) => {
    let db = oledb.sqlConnection(connectionString);
    t.equal(db.connectionString, connectionString);
    t.end();
});

tap('oledb connection type must be oledb', (t) => {
    let db = oledb.oledbConnection(connectionString);
    t.equal(db.connectionType, 'oledb');
    t.end();
});

tap('odbc connection type must be oledb', (t) => {
    let db = oledb.odbcConnection(connectionString);
    t.equal(db.connectionType, 'odbc');
    t.end();
});

tap('sql connection type must be oledb', (t) => {
    let db = oledb.sqlConnection(connectionString);
    t.equal(db.connectionType, 'sql');
    t.end();
});

tap('oledb query fails if command is empty', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = '';

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc query fails if command is empty', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = '';

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql query fails if command is empty', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = '';

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb scalar fails if command is empty', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = '';

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc scalar fails if command is empty', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = '';

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql scalar fails if command is empty', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = '';

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb execute fails if command is empty', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = '';

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc execute fails if command is empty', (t) => {
    let db = oledb.odbcConnection(connectionString);
    let command = '';

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql execute fails if command is empty', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = '';

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb query fails if command is null', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = null;

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc query fails if command is null', (t) => {
    let db = oledb.odbcConnection(connectionString);
    let command = null;

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql query fails if command is null', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = null;

    db.query(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb scalar fails if command is null', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = null;

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc scalar fails if command is null', (t) => {
    let db = oledb.odbcConnection(connectionString);
    let command = null;

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql scalar fails if command is null', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = null;

    db.scalar(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb execute fails if command is null', (t) => {
    let db = oledb.oledbConnection(connectionString);
    let command = null;

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc execute fails if command is null', (t) => {
    let db = oledb.odbcConnection(connectionString);
    let command = null;

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql execute fails if command is null', (t) => {
    let db = oledb.sqlConnection(connectionString);
    let command = null;

    db.execute(command)
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb query fails if command is undefined', (t) => {
    let db = oledb.oledbConnection(connectionString);

    db.query()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc query fails if command is undefined', (t) => {
    let db = oledb.odbcConnection(connectionString);

    db.query()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql query fails if command is undefined', (t) => {
    let db = oledb.sqlConnection(connectionString);

    db.query()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb scalar fails if command is undefined', (t) => {
    let db = oledb.oledbConnection(connectionString);

    db.scalar()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc scalar fails if command is undefined', (t) => {
    let db = oledb.odbcConnection(connectionString);

    db.scalar()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql scalar fails if command is undefined', (t) => {
    let db = oledb.sqlConnection(connectionString);

    db.scalar()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('oledb execute fails if command is undefined', (t) => {
    let db = oledb.oledbConnection(connectionString);

    db.execute()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('odbc execute fails if command is undefined', (t) => {
    let db = oledb.odbcConnection(connectionString);

    db.execute()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});

tap('sql execute fails if command is undefined', (t) => {
    let db = oledb.sqlConnection(connectionString);

    db.execute()
    .then(result => {
        t.fail('should have not been a successful command.');
    })
    .catch(err => {
        t.end();
    });
});
