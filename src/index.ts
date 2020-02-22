/**!
 * @name ApiModule
 * @author Alan chen 
 * @since 2020/2/21
 * @license Anti996
 */
import {
    PreConfig,
    RequestModuleConfig,
    ApiConfig,
    RequestConfig,
    ModuleApiConfig,
    RequestHandler,
    ResponsePromise
} from "./type";
import {
    DEFAULT_DYNAMICROUTER_RPATTERN,
    DYNAMICROUTER_PATTERN_FLAG,
    MODULE_PATTERN,
    DEFAULT_BASECONFIG
} from "./constant";

class ApiModule {
    private version: string = require("../package.json").version;
    private createdBy: string = "alanchenchen@github.com";
    private fetch: any;
    private moduleApiInfo: ModuleApiConfig[] = [];
    private globalApiInfo: ApiConfig = {};
    private _preConfigs: PreConfig;
    private globalConfig: RequestModuleConfig = {};

    constructor(
        fetch: RequestHandler,
        globalConfig?: RequestModuleConfig,
        configs: PreConfig = { dynamicRouterPattern: DEFAULT_DYNAMICROUTER_RPATTERN }
    ) {
        this.fetch = fetch;
        this._preConfigs = configs;
        this._init(globalConfig);
    }

    /**
     * 初始化全局配置.
     * 
     * @param globalConfig 
     */
    private _init(globalConfig: RequestModuleConfig = {}) {
        /* 用户传入的全局配置参数和默认参数合并 */
        this.globalConfig = { ...DEFAULT_BASECONFIG, ...globalConfig };
    }

    /**
     * axios核心方法
     * 
     * @param url 请求地址
     * @param data 请求体或URL拼接的query参数
     * @param dynamicRouterParams URL拼接的动态路由参数 
     * @param config 配置信息，默认是axios的配置项，支持额外1个参数dynamicRouter
     */
    private _base(
        url: string,
        data: any,
        dynamicRouterParams: object,
        config: RequestModuleConfig
    ) {
        const isDynamicRouter = Boolean(config.dynamicRouter);
        const method = config.method.toUpperCase();
        let _data = {}, _url = url;

        /* 先区分是动态路由还是静态路由请求 */
        if (isDynamicRouter) {
            if (Object.prototype.toString.call(dynamicRouterParams) == "[object Object]") {
                /* 将动态路由参数中的占位符替换成请求中的路由参数 */
                Object.entries(dynamicRouterParams).forEach((item: any) => {
                    const regArg = this._preConfigs.dynamicRouterPattern.replace(new RegExp(`${DYNAMICROUTER_PATTERN_FLAG}`, "g"), item[0]);
                    const rule = new RegExp(`(${regArg})`, "g");
                    _url = _url.replace(rule, item[1]);
                })
            }
            else {
                throw new Error("when you use dynamicRouter params request, data must be object")
            }
        }

        if (Boolean(data)) {
            /**
             * 如果data作为请求体信息传输，data可以是以下任意类型：
             * - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
             * - 浏览器专属：FormData, File, Blob
             * - Node 专属： Stream
             **/
            const NeedRequestBodyMethods = ["PUT", "POST", "PATCH"];
            /* 再区分是传params(请求方式通过头部url的queryString),还是传data(请求方式通过请求体的data) */
            _data = NeedRequestBodyMethods.includes(method)
                ? { data }
                : { params: data };
        }

        return this.fetch({
            url: _url,
            ..._data,
            ...config,
            /* 当method为PUT、POST和PATCH等时，只处理了json和form编码，将data以form或json编码格式传递。其余编码格式将不会对请求数据做任何处理！*/
            transformRequest: [
                (data: any) => {
                    let result: any;
                    const CONTENT_TYPE = config.headers["Content-Type"];

                    switch (CONTENT_TYPE) {
                        case "application/x-www-form-urlencoded":
                            let ret = "";
                            for (let it in data) {
                                ret += "&" + encodeURIComponent(it) + "=" + encodeURIComponent(data[it]);
                            }
                            result = ret.substring(1);
                            break
                        case "application/json":
                            result = JSON.stringify(data);
                            break
                        default:
                            result = data;
                    }

                    return result;
                }
            ]
        });
    }

    /**
     * 发出请求，实例方法而不是原型对象方法，为了可以单独调用request而不使this指向undefined报错。
     * 
     * @param url apiConfig中的key名
     * @param data 请求的内容，可以是请求头中的queryString键值对，也可以是请求体的内容
     * @param dynamicRouterParams 动态路由参数，键值对。
     * @param module 指定哪个模块。
     */
    public request = ({
        url: name,
        data,
        dynamicRouterParams,
        module
    }: RequestConfig): ResponsePromise => {
        /**
         * 调用api函数时有两种模块config引入写法，一种是url中带->。一种是module字段声明，如果两种写法同时存在，module字段优先级更高
         */
        const isUseModule = Boolean(module) || name.includes(MODULE_PATTERN);
        const moduleName = module || name.split(MODULE_PATTERN)[0].trim();
        const pathName = (name.includes(MODULE_PATTERN) && name.split(MODULE_PATTERN)[1].trim()) || name;
        const targetConfig = isUseModule
            ? this.moduleApiInfo.find(item => item.name == moduleName).module
            : this.globalApiInfo;

        if (!Boolean(targetConfig[pathName])) {
            throw new Error("could not find the request url, please check whether you register module");
        }

        const { url, ...rest } = targetConfig[pathName];
        /* 具体接口的配置参数和全局配置合并, headers因为是嵌套对象，所以需要单独合并 */
        const { headers, ...restConfig } = rest;
        let config = { ...this.globalConfig, ...restConfig };
        config.headers = { ...config.headers, ...headers };
        return this._base(url, data, dynamicRouterParams, config);
    }

    /**
     * 注册全局config.
     * 
     * @param apiConfig 
     */
    registerGlobal(apiConfig: ApiConfig): ApiModule {
        this.globalApiInfo = apiConfig;
        return this;
    }

    /**
     * 注册模块config，模块会自带命名空间，避免了命名冲突.
     * 
     * @param name 必选，模块名
     * @param module 必选，模块module的写法与apiConfig一致
     */
    registerModule({ name, module }: ModuleApiConfig): ApiModule {
        if (Boolean(name) && typeof name == "string") {
            this.moduleApiInfo.push({
                name,
                module
            });
            return this;
        }
        else {
            throw new Error("if you use the module, the module name is necessary");
        }
    }

    /**
     * 更新全局headers
     * 
     * @param rest 
     */
    setHeader(...rest: any): ApiModule {
        if (rest.length == 1 && typeof rest == "object") {
            for (const key of Object.keys(rest[0])) {
                this.globalConfig.headers[key] = rest[0][key];
            }
        }
        else if (rest.length == 2) {
            this.globalConfig.headers[rest[0]] = rest[1];
        }
        else {
            throw new Error("the maximum length of arguments is 2, if there is only one, it must be object ");
        }
        return this;
    }
}

export const CONSTANT = {
    DEFAULT_DYNAMICROUTER_RPATTERN,
    DYNAMICROUTER_PATTERN_FLAG,
    MODULE_PATTERN,
    DEFAULT_BASECONFIG
};
export default ApiModule;