/**
 * Created by DracoMithril on 29.06.2017.
 */
const restyfy = require('restify');


const server = restyfy.createServer({});


server.get('/random', function (req, res, next) {
    const random =Math.floor(Math.random() * 100);
    console.log(random);
    res.send(random.toString());
    return next();
});

server.get('/getWeather', function (req, res, next) {
    //https://www.metaweather.com/api/location/44418/

    res.send('hello world');
    return next();
});

server.listen(3001);