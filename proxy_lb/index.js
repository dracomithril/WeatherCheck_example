/**
 * Created by Gryzli on 29.06.2017.
 */
const restyfy = require('restify');


const server =restyfy.createServer({});

server.get('/', function (req, res, next) {
    res.send('hello world');
    return next();
});

server.listen(3001);