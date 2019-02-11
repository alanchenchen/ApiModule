const assert = require('assert')
const ApiModule = require('../src/index').ApiModule
const {fork} = require('child_process')

const serverIns = fork('example/server.js')

const api = new ApiModule({
                baseURL: 'http://localhost:7070'
            })
            .registerModule({name: 'Hello', module: require('../example/api/moduleA')})
            .registerModule({name: 'Hi', module: require('../example/api/moduleB')})
            .createApi({
                say: {
                    method: 'POST',
                    url: 'sayYo',
                    headers: {
                        'Author': 'Alan Chen',
                        'From': 'Global'
                    }
                }
            })

describe('ApiModule', function() {
    after('if all tests succeed, close the http process', function() {
        serverIns.kill('SIGKILL')
    })

    describe('normal use', function() {
        it('normal use, it would request the url by createApi', function(done) {
            api({
                url: 'say',
            })
            .then(({data}) => {
                assert.equal(data, 'Yo  Alan Chen， 来自Global模块')
                done()
            })
            .catch(err => {
                done(err.config)
            })
        })
    })

    describe('module use', function() {
        it('module config use, it would request the url by moduel key', function(done) {
            api({
                url: 'say',
                module: 'Hello'
            })
            .then(({data}) => {
                assert.equal(data, 'Hello  Alan Chen， 来自Module Hello模块')
                done()
            })
            .catch(err => {
                done(err.config)
            })
        })
    
        it('module config use, it would request the url by -> url', function(done) {
            api({
                url: 'Hi -> say',
            })
            .then(({data}) => {
                assert.equal(data, 'Hi  Alan Chen， 来自Module Hi模块')
                done()
            })
            .catch(err => {
                done(err.config)
            })
        })
    })
})