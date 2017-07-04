/**
 * Created by DracoMithril on 01.07.2017.
 */
const request = require('request-promise-native');
const url = require('url');
const restyfy = require('restify');
const server = restyfy.createServer({name: 'endpoint_ctrl'});
const port = process.env.PORT || 8080;
const endpoints = [
    {city: 'London', url: 'https://www.metaweather.com/api/location/44418/'},
    {city: 'San Francisco', url: 'https://www.metaweather.com/api/location/2487956/2013/4/30/'}
];
// const regex = /(https:\/\/www\.metaweather\.com\/api\/location\/\d*\/)/g;
server.get('/randomNumber', function (req, res, next) {
    const random = Math.floor(Math.random() * 100);
    console.log(random);
    res.send(random.toString());
    return next();
});
server.get('/api/instance/endpoints', function (req, res, next) {
    res.send(endpoints);
    return next();
});
server.put('/api/instance/endpoints', function (req, res, next) {
    //todo option to add endpoints
    //needs to get name of city
    res.send(500, 'not implemented');
    return next();
});
server.get('/api/health', function (req, res, next) {
    res.send(200, "OK");
    next();
});
server.get('/getWeather', function (req, res, next) {
    console.log("request to port: " + port);
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

    const actions = endpoints.map(elem => {
            //todo add regex
            let urlObj = url.parse(elem.url);
            let test = urlObj.path.match(/[^\/]+/g);

            const fun = test.length > 3 ? onLocationWithDate : onLocation;
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
        let cityTemp = result.map((e, i) => {
            return {
                city: endpoints[i].city,
                avg: e
            };
        });
        let city = cityTemp[result.indexOf(Math.max(...result))];
        res.send(city);

        return next();
    }).catch(e => {
        console.error(e);
        res.send(500,'something went wrong');
        return next();
    });
});

server.listen(port, () => console.log(`server started on port ${port}`));
module.exports = server;