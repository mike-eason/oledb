# OLE DB Edge
A small **promise based** module which uses [Edge](https://github.com/tjanczuk/edge) to connect and execute queries for an [OLE DB](https://en.wikipedia.org/wiki/OLE_DB).

## Example
```
const connectionString = 'provider=vfpoledb;data source=C:/MyDatabase.dbc';
const oledb = require('oledb-edge')(connectionString);

let query = 'select * from account';

oledb.query(query)
.then(function(data) {
    console.log(data);
},
function(error) {
    console.error(error);
});
```

## Installation
```
npm install oledb-edge --save
```

## License
This project is licensed under [MIT](LICENSE).