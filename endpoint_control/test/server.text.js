/**
 * Created by DracoMithril on 01.07.2017.
 */
'use strict';
const chai = require('chai'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    hippie = require('hippie'),
    assert = sinon.assert,
    expect = chai.expect;
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
                // .expectKey('username')
                // .expectValue('username', 'vesln')
                // .expectValue('repos[0].name', 'jsmd')
                // .expectBody()
                .expectBody({ city: 'London', avg: 20.037499999999998 })
                .end(function (err, res, body) {
                    if (err) throw err;
                    sinon.assert.callCount(requestMock.get, 2);
                    done();
                });
        });
    });

});