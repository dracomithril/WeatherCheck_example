/**
 * Created by DracoMithril on 01.07.2017.
 */
const request = require('request-promise-native');

const restyfy = require('restify');
const server = restyfy.createServer({});
const array = [
    {city: 'London', url: 'https://www.metaweather.com/api/location/44418/'},
    {city: 'San Francisco', url: 'https://www.metaweather.com/api/location/2487956/2013/4/30/'}
];
const regex = /ht{2}ps?:\/{2}w{3}.metaweather\.com\/api\/location((?:\/\d*\/\d{4}\/\d\/\d{2})|(?:\/\d*\/))/g;
server.get('/random', function (req, res, next) {
    const random = Math.floor(Math.random() * 100);
    console.log(random);
    res.send(random.toString());
    return next();
});

server.get('/getWeather', function (req, res, next) {
    const onLocationWithDate = res => {
        return Promise.resolve(res);
    };
    const onLocation = res => {
        return Promise.resolve(res.consolidated_weather);
    };

    function mapArray(array) {
        let map = array.map(elem => elem.the_temp || ((elem.min_temp + elem.max_temp) / 2));
        let reduce = map.reduce((prev, curr) => prev + curr);
        let temp = reduce / array.length;
        return Promise.resolve(temp);
    }

    const actions = array.map(elem => {
            //add regex
            let test = elem.url.split('/');
            const fun = test.length > 7 ? onLocationWithDate : onLocation;
            return request.get({
                uri: elem.url,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            }).then(fun).then(mapArray)
        }
    );
    Promise.all(actions).then(result => {
        console.log(result);
        res.send(result);
        return next();
    }).catch(e => {
        console.error(e);
        res.status(500).send('something went wrong');
        return next();
    });
// res.send('hello world');
});
module.exports = server;