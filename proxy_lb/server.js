/**
 * Created by DracoMithril on 07.08.2017.
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
    randomNumber: new Set(),
    getWeather: new Set()
};
[{env:'ENDPOINTS_GW',name:'getWeather'},{env:'ENDPOINTS_RN',name:'randomNumber'}].forEach(elem=>{
    try {
        console.log(`ini env for ${elem.env} is: ${process.env[elem.env]}`);
        epc[elem.name] = process.env[elem.env] ? new Set(JSON.parse(process.env[elem.env])) : new Set();
        console.log(`epc after config is: ${[...epc[elem.name]]}`)
    } catch (e) {
        console.log(`wrong params for ${elem.env} list will be empty`)
    }
});


const endpoint_health_check = function () {
    let epc_all = new Set([...epc.randomNumber, ...epc.getWeather]);
    console.log(`[START] health-check for ${epc_all.size} instances`);
    let actions = [...epc_all].map(elem => {
        const health_check_url = url.resolve(elem, '/api/health');
        return request.get(health_check_url, {
            resolveWithFullResponse: true
        }).then(resp => Promise.resolve(resp.statusMessage)).catch(e => Promise.resolve(elem))
    });
    return Promise.all(actions).then(result => {
        let arr = _.filter(result, elem => elem !== "OK");
        arr.forEach((elem) => {
            epc.getWeather.delete(elem);
            epc.randomNumber.delete(elem);
            console.log(`After HealthCheck ${elem} was deleted`);
        });
        return Promise.resolve()
    }).catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
};
setInterval(endpoint_health_check, 5000);

app.put('/api/lb/registerInstance', function (req, res) {
    const instance = req.body;
    if (validate(instance)) {
        if (epc[instance.type].has(instance.url)) {
            return res.status(400).send({message: 'we have that endpoint'})
        } else {
            epc[instance.type].add(instance.url);
            // indexEndpoints();
            console.log('added instance ' + instance.url);
            return res.status(201).send({message: 'added instance ' + instance.url})
        }
    } else {
        return res.status(400).send({message: 'Sorry change something and try again ;)'})
    }
});
app.get('/api/lb/instances', function (req, res) {
    let endpoints = new Set([...epc.getWeather, ...epc.randomNumber]);
    let result = [...endpoints].map(elem => {
        let roles = [];
        Object.keys(epc).forEach(el_epc => {
            if (epc[el_epc].has(elem)) {
                roles.push(el_epc)
            }
        });
        return {
            url: elem,
            roles: roles
        }
    });
    return res.send(result);
});
/**
 *
 * @param array [Array] endpoints list
 * @param req express request object
 * @param res express response object
 */
const realHandler = (array, req, res) => {
    if (array.length === 0) {
        return res.sendStatus(404)
    } else {
        const redirectUrl = array[Math.floor(Math.random() * array.length)] + req.url;
        //that will need to be extended if other methods (put, post,...) will be implemented
        console.log("request to : "+redirectUrl);
        return req.pipe(request.get(redirectUrl)).pipe(res);
    }
};
const roles = [{
    name: '/getWeather', handler: (req, res) => realHandler([...epc.getWeather], req, res)
}, {
    name: '/randomNumber', handler: (req, res) => realHandler([...epc.randomNumber], req, res)
}];
for (let r of roles) {
    if (r.hasOwnProperty('name') && r.hasOwnProperty('handler')) {
        app.get(r.name, r.handler)
    }
}

let port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server started on port ${port}`));
module.exports = app;