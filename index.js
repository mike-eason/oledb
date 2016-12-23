const edge = require('edge');
const data = edge.func(__dirname + '/Data.cs');

let connectionString;

module.exports = function(constring) {
    if (constring == null || constring.trim() === '')
        throw 'constring must not be null or empty';

    connectionString = constring;

    function executePromise(command, type) {
        return new Promise(function(resolve, reject) {
            let options = {
                constring: connectionString,
                query: command,
                type: type
            };

            data(options, (err, data) => {
                if (err)
                    return reject(err);
                
                return resolve(data);
            });
        });
    }

    return {
        query: function(command) {
            return executePromise(command, 'query');
        },
        execute: function(command) {
            return executePromise(command, 'command');
        }
    };
};