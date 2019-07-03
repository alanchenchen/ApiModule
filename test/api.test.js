const assert = require('assert')
const ApiModule = require('../src/index').ApiModule
const {fork} = require('child_process')
const {join} = require('path')

const serverIns = fork(join(process.cwd(), 'example/server.js'))

const api = new ApiModule({
                baseURL: 'http://localhost:7070'
            }, {
                // 自定义动态路由的占位符为@开头
                dynamicRouterPattern: '@pattern'
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
                },
                person: {
                    method: 'POST',
                    url: 'person/@name/@age',
                    dynamicRouter: true
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
                assert.strictEqual(data, 'Yo  Alan Chen， 来自Global模块')
                done()
            })
            .catch(err => {
                if(err) {
                    done(err)
                }
            })
        })

        it('dynamicRouter use, it would request the url with formated params', function(done) {
            api({
                url: 'person',
                dynamicRouterParams: {
                    name: 'alan',
                    age: 25
                }
            })
            .then(({data}) => {
                assert.strictEqual(data, 'your name is alan, and you are 25 years old')
                done()
            })
            .catch(err => {
                if(err) {
                    done(err)
                }
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
                assert.strictEqual(data, 'Hello  Alan Chen， 来自Module Hello模块')
                done()
            })
            .catch(err => {
                if(err) {
                    done(err)
                }
            })
        })
    
        it('module config use, it would request the url by -> url', function(done) {
            api({
                url: 'Hi -> say',
            })
            .then(({data}) => {
                assert.strictEqual(data, 'Hi  Alan Chen， 来自Module Hi模块')
                done()
            })
            .catch(err => {
                if(err) {
                    done(err)
                }
            })
        })
    })
})