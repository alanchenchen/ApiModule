import assert from "assert";
import axios from "axios";
import ApiModule, { CONSTANT } from "../src/index";
import { fork } from "child_process";
import { join } from "path";
import moduleA from "../example/api/moduleA";
import moduleB from "../example/api/moduleB";

const serverIns = fork(join(process.cwd(), "example/server.js"))

const api = new ApiModule(axios, {
    baseURL: "http://127.0.0.1:7070",
    timeout: 10000
}, {
    // 自定义动态路由的占位符为@开头
    dynamicRouterPattern: `@${CONSTANT.DYNAMICROUTER_PATTERN_FLAG}`
});

const { request } = api.registerModule({ name: "Hello", module: moduleA as any })
    .registerModule({ name: "Hi", module: moduleB as any })
    .registerGlobal({
        say: {
            method: "POST",
            url: "sayYo",
            headers: {
                "Author": "Alan Chen",
                "From": "Global"
            }
        },
        person: {
            method: "POST",
            url: "person/@name/@age",
            dynamicRouter: true
        }
    });

describe("ApiModule", function () {
    after("if all tests succeed, close the http process", function () {
        serverIns.kill("SIGKILL")
    })

    describe("normal use", function () {
        it("normal use, it would request the url by globalApi", function (done) {
            request({
                url: "say",
            })
                .then(({ data }) => {
                    assert.strictEqual(data, "Yo  Alan Chen， 来自Global模块")
                    done()
                })
                .catch(err => {
                    if (err) {
                        done(err)
                    }
                })
        })

        it("dynamicRouter use, it would request the url with formated params", function (done) {
            request({
                url: "person",
                dynamicRouterParams: {
                    name: "alan",
                    age: 25
                }
            })
                .then(({ data }) => {
                    assert.strictEqual(data, "your name is alan, and you are 25 years old")
                    done()
                })
                .catch(err => {
                    if (err) {
                        done(err)
                    }
                })
        })
    })

    describe("module use", function () {
        it("module config use, it would request the url by moduel key", function (done) {
            request({
                url: "say",
                module: "Hello"
            })
                .then(({ data }) => {
                    assert.strictEqual(data, "Hello  Alan Chen， 来自Module Hello模块")
                    done()
                })
                .catch(err => {
                    if (err) {
                        done(err)
                    }
                })
        })

        it("module config use, it would request the url by -> url", function (done) {
            request({
                url: "Hi -> say",
            })
                .then(({ data }) => {
                    assert.strictEqual(data, "Hi  Alan Chen， 来自Module Hi模块")
                    done();
                })
                .catch(err => {
                    if (err) {
                        done(err);
                    }
                });
        })
    })
})