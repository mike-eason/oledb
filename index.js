const edge = require('edge');
const data = edge.func(__dirname + '/Data.cs');

module.exports = function(constring) {
    if (constring == null || constring.trim() === '')
        throw 'constring must not be null or empty';

    let connectionString = constring;

    function executePromise(command, type, params) {
        return new Promise(function(resolve, reject) {
            let options = {
                constring: connectionString,
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