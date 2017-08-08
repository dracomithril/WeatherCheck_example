'use strict';
const chai = require('chai'),
    sinon = require('sinon'),
    assert = sinon.assert,
    rewire = require('rewire'),
    hippie = require('hippie'),
    expect = chai.expect;
chai.should();

describe('[Proxy lb]', function () {
    let server;
    let requestMock = {
        get: undefined,
        put: undefined
    };
    this.timeout(5000);
    before(function () {
        this.clock = sinon.useFakeTimers();
        server = rewire('./../server.js');
        let request = server.__get__('request');
        requestMock.get = sinon.stub(request, 'get');
        requestMock.put = sinon.stub(request, 'put');
    });
    after(function () {
    });
    beforeEach(function () {
    });
    afterEach(function () {
        requestMock.get.reset();
        requestMock.put.reset();
    });
    describe('registerInstance', function () {
        it("should be able to add new endpoint for any type", function (done) {
            hippie(server).json()
                .url('/api/lb/registerInstance').method('PUT').send({
                "type": "getWeather",
                "url": "http://localhost:3005"
            })
                .expectStatus(201)
                .expectHeader('Content-Type', 'application/json; charset=utf-8')
                .expectBody('{"message":"added instance http://localhost:3005"}')
                .end(function (err) {
                    if (err) throw err;
                    done();
                });
        });
        it('should add instance only once', function (done) {
            hippie(server).json()
                .url('/api/lb/registerInstance').method('PUT').send({
                "type": "getWeather",
                "url": "http://localhost:3005"
            })
                .expectStatus(400)
                .expectHeader('Content-Type', 'application/json; charset=utf-8')
                .expectBody('{"message":"we have that endpoint"}')
                .end(function (err) {
                    if (err) throw err;
                    done();
                });
        });
        it('should react if body is incorrect', function (done) {
            hippie(server).json()
                .url('/api/lb/registerInstance').method('PUT').send({
                "typo": "getWeather",
                "url": "http://localhost:3005"
            })
                .expectStatus(400)
                .expectHeader('Content-Type', 'application/json; charset=utf-8')
                .expectBody('{"message":"Sorry change something and try again ;)"}')
                .end(function (err) {
                    if (err) throw err;
                    done();
                });
        });
        it('should be able to get all instances', function (done) {
            server.__set__('epc', {
                randomNumber: new Set(["//localhost:5000", "//localhost:3000"]),
                getWeather: new Set(["//localhost:5000", "//localhost:4000"])
            });
            hippie(server).json()
                .url('/api/lb/instances').method('GET')
                .expectStatus(200)
                .expectHeader('Content-Type', 'application/json; charset=utf-8')
                .expectBody('[{"url":"//localhost:5000","roles":["randomNumber","getWeather"]},{"url":"//localhost:4000","roles":["getWeather"]},{"url":"//localhost:3000","roles":["randomNumber"]}]')
                .end(function (err) {
                    done(err);
                });
        });
    });
    describe('test health check', function () {
        it('should delete not healthy instances', function (done) {
            server.__set__('epc', {
                randomNumber: new Set(["//localhost:5000", "//localhost:3000"]),
                getWeather: new Set(["//localhost:5000", "//localhost:4000"])
            });
            requestMock.get.withArgs('//localhost:5000/api/health')
                .returns(Promise.reject(new Error('fake error')));
            requestMock.get.withArgs('//localhost:4000/api/health')
                .returns(Promise.resolve({statusMessage: "OK"}));
            requestMock.get.withArgs('//localhost:3000/api/health')
                .returns(Promise.resolve({statusMessage: "OK"}));
            const healt_check = server.__get__("endpoint_health_check");
            healt_check().then(() => {
                const epc = server.__get__('epc');
                expect(epc.getWeather.size).to.eql(1);
                expect(epc.randomNumber.size).to.eql(1);
                done();
            }).catch(e => done(e));
        });
    });
    describe('router functionality', function () {
        it('should redirect to random instance', function (done) {
            const base = {
                randomNumber: [],
                getWeather: ["//localhost:5000", "//localhost:4000"]
            };
            let realHandler = server.__get__('realHandler');
            const resp = {end: sinon.stub()};
            requestMock.get.withArgs('//localhost:5000/getWeather').returns(resp);
            const req = {
                pipe: sinon.stub(),
                url: '/getWeather'
            };
            const redirect = {pipe: sinon.stub()};
            req.pipe.returns(redirect);
            const res = {};
            realHandler(base.getWeather, req, res);
            assert.calledOnce(req.pipe);
            assert.calledOnce(redirect.pipe);
            assert.calledWith(redirect.pipe, res);
            assert.calledOnce(requestMock.get);
            assert.calledWith(requestMock.get, sinon.match((value) => base.getWeather.includes(value.replace(req.url, ''))));
            done();
        });
        it('should react if array is empty', function () {

            let realHandler = server.__get__('realHandler');
            const resp = {end: sinon.stub()};
            requestMock.get.withArgs('//localhost:5000/getWeather').returns(resp);
            const req = {
                pipe: sinon.stub(),
                url: '/getWeather'
            };
            const redirect = {pipe: sinon.stub()};
            req.pipe.returns(redirect);
            const res = {sendStatus: sinon.stub()};
            realHandler([], req, res);
            assert.calledOnce(res.sendStatus);
            assert.calledWith(res.sendStatus, 404);
        });
    });
});