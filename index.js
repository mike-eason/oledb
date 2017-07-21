const edge = require('edge');
const data = edge.func(__dirname + '/Data.cs');

function executePromise(constring, contype, command, type, params, returns) {
    if (command == null || command.length === 0)
        return Promise.reject('Command string cannot be null or empty.');

    if (params != null && !Array.isArray(params))
        params = [params];

    if (params) {
        if (!Array.isArray(params))
            return Promise.reject('Params must be an array type.');

        for(let i = 0; i < params.length; i++) {
            if (Array.isArray(params[i]))
                return Promise.reject('Params cannot contain sub-arrays.');
        }
    }

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