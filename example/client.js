const ApiModule = require('../src/index').ApiModule

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
            },
            //登入接口
            login: {
                url: 'sign/login', //url为具体的接口名称
                method: 'GET', //默认为GET请求，可以不填
                timeout: 5000 //将此接口的超时处理时间改为5s
            },
            //登出接口
            logout: {
                url: 'sign/logout/name/:name/date/:date', //通过占位符来处理路由参数格式，具体参数将在api函数内通过dynamicRouterParams传入
                method: 'PUT', //PUT请求，此时请求头编码格式默认为form表单
                dynamicRouter: true //插件自带的配置项，不是axios自带。开启后支持请求后台的动态路由。例如：sing/logout/alan。此时alan是作为参数被后台解析
            },
            //更改用户权限接口
            setRoleAccess: {
                url: 'role/queryAccess',
                method: 'POST', //POST请求
                headers: { 
                    'Content-Type': 'application/json', //请求头编码格式改为json
                    'Author': 'Alan' //自定义接口的请求头
                }
            }
        })

const clientReq = async () => {
    // 不声明module字段，也没有 -> 写法，所以直接匹配全局的say
    const globalConfig = await api({url: 'say'})
    console.log(globalConfig.data)
    // 通过 -> 写法，直接匹配Hello模块的say
    const moduleA = await api({url: 'Hello -> say'})
    console.log(moduleA.data)
    // 通过声明module字段，直接匹配Hi模块的say
    const moduleB = await api({url: 'say', module: 'Hi'})
    console.log(moduleB.data)
}

clientReq()