import ApiModule from "../src/index";
import { ApiConfig } from "../src/type";
import moduleA from "./api/moduleA";
import moduleB from "./api/moduleB";

const globalApiConfig: ApiConfig = {
    say: {
        method: "POST",
        url: "sayYo",
        headers: {
            "Author": "Alan Chen",
            "From": "Global"
        }
    },
    name: {
        method: "GET",
        url: "name/:name/age/:age", //通过占位符来处理路由参数格式，具体参数将在api函数内通过dynamicRouterParams传入
        dynamicRouter: true, //插件自带的配置项，不是axios自带。开启后支持请求后台的动态路由。例如：name/alan/age/24。此时alan和24是作为参数被后台解析
        headers: {
            "Author": "Alan" //自定义接口的请求头
        },
        timeout: 3000
    }
};

const api = new ApiModule({
    baseURL: "http://localhost:7070"
})
    .registerModule({ name: "Hello", module: moduleA as any })
    .registerModule({ name: "Hi", module: moduleB as any })
    .registerGlobal(globalApiConfig);


const clientReq = async () => {
    // 不声明module字段，也没有 -> 写法，所以直接匹配全局的say
    const globalConfig = await api.request({ url: "say" });
    console.log(globalConfig.data);
    // 通过 -> 写法，直接匹配Hello模块的say
    const moduleA = await api.request({ url: "Hello -> say" });
    console.log(moduleA.data);
    // 通过声明module字段，直接匹配Hi模块的say
    const moduleB = await api.request({ url: "say", module: "Hi" });
    console.log(moduleB.data);
    // 动态路由传参请求，且更新全局headers
    api.setHeader("test", "哈皮");
    const routerPath = await api.request({
        url: "name",
        dynamicRouterParams: {
            "name": "alan",
            "age": 24
        }
    });
    console.log(routerPath.data);
}

clientReq();