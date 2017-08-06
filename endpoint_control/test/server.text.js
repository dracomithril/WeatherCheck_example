/**
 * Created by DracoMithril on 01.07.2017.
 */
'use strict';
const chai = require('chai'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    hippie = require('hippie');
chai.should();
let London = require('./data/London.json');
let San_Francisco = require('./data/San Francisco.json');

describe('[index]', function () {
    let server;
    let requestMock = {
        get: undefined
    };
    this.timeout(1000);
    before(function () {
        server = rewire('./../server.js');
        let request = server.__get__('request');
        requestMock.get = sinon.stub(request, 'get');
    });
    after(function () {
    });
    beforeEach(function () {
    });
    afterEach(function () {
    });
    describe('getWeather', function () {
        it("getWeather", function (done) {
            requestMock.get.onCall(0).returns(Promise.resolve(London));
            requestMock.get.onCall(1).returns(Promise.resolve(San_Francisco));
            hippie(server).json()
                .get('/getWeather').expectStatus(200)
                .expectHeader('Content-Type', 'application/json')
                .expectBody({ city: 'London', avg: 20.037499999999998 })
                .end(function (err, res, body) {
                    if (err) throw err;
                    sinon.assert.callCount(requestMock.get, 2);
                    done();
                });
        });
        it("error case", function (done) {
            requestMock.get.throws(new Error('test error'));
            hippie(server).json()
                .get('/getWeather').expectStatus(500)
                .expectHeader('Content-Type', 'application/json')
                .expectBody({ code: 'InternalError', message: 'test error' })
                .end(function (err, res, body) {
                    if (err) throw err;
                    sinon.assert.callCount(requestMock.get, 3);
                    done();
                });
        });
    });
    describe('health check', function () {
        it("sunny day", function (done) {
            hippie(server).json()
                .get('/api/health').expectStatus(200)
                .expectHeader('Content-Type', 'application/json')
                .expectBody('"OK"')
                .end(function (err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
    });
    describe('instance endpoints', function () {
        it("get", function (done) {
            hippie(server).json()
                .get('/api/instance/endpoints').expectStatus(200)
                .expectHeader('Content-Type', 'application/json')
                .expectBody('[{"city":"London","url":"https://www.metaweather.com/api/location/44418/"},{"city":"San Francisco","url":"https://www.metaweather.com/api/location/2487956/2013/4/30/"}]')
                .end(function (err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
        it("put", function (done) {
            hippie(server).json()
                .put('/api/instance/endpoints').expectStatus(500)
                .expectHeader('Content-Type', 'application/json')
                .expectBody('"not implemented"')
                .end(function (err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('RandomNumber', function () {
        it("get", function (done) {
            let mathRandom=sinon.stub(Math,'random');
            mathRandom.returns(0.7216);
            hippie(server).json()
                .get('/randomNumber').expectStatus(200)
                .expectHeader('Content-Type', 'application/json')
                .expectBody('"72"')
                .end(function (err, res, body) {
                    if (err) throw err;
                    done();
                });
        });
    });

});