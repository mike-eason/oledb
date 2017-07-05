const edge = require('edge');
const data = edge.func(__dirname + '/Data.cs');

function executePromise(constring, contype, command, type, params, returns) {
    return new Promise((resolve, reject) => {
        let options = {
            constring: constring,
            connection: contype,
            query: command,
            type: type,
            params: params || [],
            returns: returns
        };

        data(options, (err, data) => {
            if (err)
                return reject(err);
            
            return resolve(data);
        });
    });
}

class Connection {
    constructor(constring, contype) {
        if (constring == null || constring.trim() === '')
            throw new Error('constring must not be null or empty');
        if (contype == null || contype.trim() === '')
            contype = 'oledb';

        this.connectionString = constring;
        this.connectionType = contype;
    }

    query(command, params) {
        return executePromise(this.connectionString, this.connectionType, command, 'query', params);
    }

    scalar(command, params) {
        return executePromise(this.connectionString, this.connectionType, command, 'scalar', params);
    }

    execute(command, params) {
        return executePromise(this.connectionString, this.connectionType, command, 'command', params);
    }

    procedure(command, params, returns) {
        return executePromise(this.connectionString, this.connectionType, command, 'procedure', params, returns);
    }
}

module.exports = {
    oledbConnection(connectionString) {
        return new Connection(connectionString, 'oledb');
    },
    odbcConnection(connectionString) {
        return new Connection(connectionString, 'odbc');
    },
    sqlConnection(connectionString) {
        return new Connection(connectionString, 'sql');
    }
};