const ApiModule = require('../src/index').ApiModule

const ins = new ApiModule({
                baseURL: 'http://localhost:7070'
            })
            .registerModule({name: 'Hello', module: require('../example/api/moduleA')})
            .registerModule({name: 'Hi', module: require('../example/api/moduleB')})

const api = ins.createApi({
    say: {
        method: 'POST',
        url: 'sayYo',
        headers: {
            'Author': 'Alan Chen',
            'From': 'Global'
        }
    },
    name: {
        url: 'name/:name/age/:age', //通过占位符来处理路由参数格式，具体参数将在api函数内通过dynamicRouterParams传入
        method: 'GET',
        dynamicRouter: true, //插件自带的配置项，不是axios自带。开启后支持请求后台的动态路由。例如：name/alan/age/24。此时alan和24是作为参数被后台解析
        headers: { 
            'Author': 'Alan' //自定义接口的请求头
        },
        timeout: 3000
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
    // 动态路由传参请求，且更新全局headers
    ins.setHeader('test', 'siwayo')
    const routerPath = await api({
        url: 'name',
        dynamicRouterParams: {
            'name': 'alan',
            'age': 24
        }
    })
    console.log(routerPath.data)
}

clientReq()