const edge = require('edge');
const data = edge.func(__dirname + '/Data.cs');

module.exports = function(constring, contype) {
    if (constring == null || constring.trim() === '')
        throw new Error('constring must not be null or empty');
    if (contype == null || contype.trim() === '')
        contype = 'oledb';

    let connectionString = constring;
    let connectionType = contype;

    function executePromise(command, type, params) {
        return new Promise((resolve, reject) => {
            let options = {
                constring: connectionString,
                connection: connectionType,
                query: command,
                type: type,
                params: params || []
            };

            data(options, (err, data) => {
                if (err)
                    return reject(err);
                
                return resolve(data);
            });
        });
    }

    return {
        query: function(command, params) {
            return executePromise(command, 'query', params);
        },
        scalar: function(command, params) {
            return executePromise(command, 'scalar', params);
        },
        execute: function(command, params) {
            return executePromise(command, 'command', params);
        }
    };
};