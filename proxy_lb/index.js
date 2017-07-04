/**
 * Created by DracoMithril on 29.06.2017.
 */
const express = require('express');
const request = require('request-promise-native');
const Ajv = require('ajv');
const bodyParser = require('body-parser');
const _ = require('lodash');
const url = require('url');
const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
const schema = require('./registerInstance.json');
const validate = ajv.compile(schema);
const app = express();
app.locals.title = 'proxy_lb';
app.use(bodyParser.json());

let epc = {
    randomNumber: [],
    getWeather: []
};

const realHandler = (array, req, res) => {
    if (array.length === 0) {
        return res.status(404).send('no instance founded')
    } else {
        return req.pipe(request({url: array[Math.floor(Math.random() * array.length)] + req.url})).pipe(res);
    }
};
const roles = [{
    name: '/getWeather', handler: (req, res) => realHandler(epc.getWeather, req, res)
}, {
    name: '/randomNumber', handler: (req, res) => realHandler(epc.randomNumber, req, res)
}];
setInterval(function () {
    //todo clearInterval if no instance founded and set it up if something changed?
    let epc_all = _.union(epc.randomNumber, epc.getWeather);
    console.log(`[START] health-check for ${epc_all.length} instances`);
    let actions = epc_all.map(elem => {
        const health_check_url = url.resolve(elem, '/api/health');
        return request({
            url: health_check_url,
            resolveWithFullResponse: true
        }).then(resp => Promise.resolve(resp.statusMessage)).catch(e => Promise.resolve(elem))
    });
    Promise.all(actions).then(result => {
        let arr = _.filter(result, (elem) => elem !== "OK");
        arr.forEach((elem) => {
            _.remove(epc.getWeather, (e => e === elem));
            _.remove(epc.randomNumber, (e => e === elem));
            console.log(`After HealthCheck ${elem} was deleted`);
        })
    }).catch(e => {
        console.error(e);
    })
}, 5000);

try {
    epc.getWeather = process.env.ENDPOINTS ? JSON.parse(process.env.ENDPOINTS) : [];
} catch (e) {
    console.log('wrong params for endpoints list will be empty')
}


app.put('/api/lb/registerInstance', function (req, res) {
    const instance = req.body;
    if (validate(instance)) {
        const indexOf = epc[instance.type].indexOf(instance.url);
        if (indexOf!==-1) {
            return res.status(400).send('we have that endpoint')
        } else {
            epc[instance.type].push(instance.url);
            console.log('added instance ' + instance.url);
            res.status(201).send('added instance ' + instance.url)
        }
    } else {
        return res.status(400).send('Sorry change something and try again ;)')
    }
});
app.get('/api/lb/instances', function (req, res) {
    return res.send(epc);
});
for (let r of roles) {
    if (r.hasOwnProperty('name') && r.hasOwnProperty('handler')) {
        app.get(r.name, r.handler)
    }
}

let port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server started on port ${port}`));