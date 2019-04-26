/**!
 * @name ApiModule
 * @author Alan chen 
 * @since 2019/2/11
 * @license MIT
 */

const axios = require('axios')

class ApiModule {
    constructor(globalConfig) {
        this.version = require('../package.json').version
        this.createdBy = 'alanchenchen@github.com'
        this.moduleInfo = []
        this._init(globalConfig)
    }

    /**
     * 初始化全局配置
     * 
     * @private
     * @param {Object} globalConfig 
     */
    _init(globalConfig = {}) {
        /* 默认配置参数 */
        const baseConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        /* 用户传入的全局配置参数和默认参数合并 */
        this.globalConfig = { ...baseConfig, ...globalConfig }
    }

    /**
     * axios核心方法
     * 
     * @private
     * @param {String} url 请求地址
     * @param {Object} data 请求体或URL拼接的query参数
     * @param {Object} dynamicRouterParams URL拼接的动态路由参数 
     * @param {Object} config 配置信息，默认是axios的配置项，支持额外1个参数dynamicRouter
     */
    _base(url, data, dynamicRouterParams, config) {
        const isDynamicRouter = Boolean(config.dynamicRouter)
        const method = config.method.toUpperCase()
        let _data = {}, _url = url

        /* 先区分是动态路由还是静态路由请求 */
        if (isDynamicRouter) {
            if (Object.prototype.toString.call(dynamicRouterParams) == '[object Object]') {
                /* 将动态路由参数中的占位符替换成请求中的路由参数 */
                Object.entries(dynamicRouterParams).forEach(item => {
                    const rule = new RegExp(`(\:${item[0]})`, 'g')
                    _url = _url.replace(rule, item[1])
                })
            }
            else {
                throw new Error('when you use dynamicRouter params request, data must be object')
            }
        }

        if (Boolean(data)) {
            if (Object.prototype.toString.call(data) != '[object Object]') {
                throw new Error('ivalid data,data must be object')
            }
            else {
                const NeedRequestBodyMethods = ['PUT', 'POST', 'PATCH']
                /* 再区分是传params(请求方式通过头部url的queryString),还是传data(请求方式通过请求体的data) */
                _data = NeedRequestBodyMethods.includes(method)
                    ? { data }
                    : { params: data }
            }
        }

        return axios({
            url: _url,
            ..._data,
            ...config,
            /* 当method为PUT、POST和PATCH等时，只处理了json和form编码，将data以form或json编码格式传递。其余编码格式将不会对请求数据做任何处理！*/
            transformRequest: [function (data) {
                let result
                const CONTENT_TYPE = config.headers['Content-Type']

                switch (CONTENT_TYPE) {
                    case 'application/x-www-form-urlencoded':
                        let ret = ''
                        for (let it in data) {
                            ret += '&' + encodeURIComponent(it) + '=' + encodeURIComponent(data[it])
                        }
                        result = ret.substring(1)
                        break
                    case 'application/json':
                        result = JSON.stringify(data)
                        break
                    default:
                        result = data
                }

                return result
            }]
        })
    }

    /**
     * 暴露出去的api方法
     * 
     * @param {Object} apiConfig 
     */
    createApi(apiConfig) {
        if (this.moduleInfo.length == 0 && Object.prototype.toString.call(apiConfig) != '[object Object]') {
            throw new Error('ivalid param, the param must be an object')
        }
        else {
            /**
             * 插件暴露出去的方法，参数是一个对象
             * @param {Object} opts
             * @param {String} opts.url apiConfig中的key名
             * @param {Object} opts.data 请求的内容，可以是请求头中的queryString键值对，也可以是请求体的内容
             * @param {Object} opts.dynamicRouterParams 动态路由参数，键值对。
             */
            return ({ url: name, data, dynamicRouterParams, module }) => {
                /**
                 * 调用api函数时有两种模块config引入写法，一种是url中带->。一种是module字段声明，如果两种写法同时存在，module字段优先级更高
                 * createApi有两种调用方式：
                 *  1. 不传入参数，默认采用模块注册，此时插件必须事先调用registerModule。并且调用api函数时必须指定模块名
                 *  2. 传入参数，通过调用api函数时model字段来决定取局部config还是全局config
                 */
                const isUseModule = Boolean(module) || name.includes('->')
                const moduleName = module || name.split('->')[0].trim()
                const pathName = (name.includes('->') && name.split('->')[1].trim()) || name
                const targetConfig = isUseModule
                    ? this.moduleInfo.find(item => item.name == moduleName).module
                    : apiConfig

                if (!Boolean(targetConfig[pathName])) {
                    throw new Error('could not find the request url, please check whether you register module or input the apiConfig')
                }

                const { url, ...rest } = targetConfig[pathName]
                /* 具体接口的配置参数和全局配置合并, headers因为是嵌套对象，所以需要单独合并 */
                const { headers, ...restConfig } = rest
                let config = { ...this.globalConfig, ...restConfig }
                config.headers = { ...config.headers, ...headers }
                return this._base(url, data, dynamicRouterParams, config)
            }
        }
    }

    /**
     * 注册模块，模块会自带命名空间，避免了命名冲突
     * 
     * @param {Object} opts
     * @param {String} opts.name 必选，模块名
     * @param {Array} opts.module 必选，模module的写法与apiConfig一致
     */
    registerModule({ name, module }) {
        if (Boolean(name) && typeof name == 'string') {
            this.moduleInfo.push({
                name,
                module
            })
            return this
        }
        else {
            throw new Error('if you use the module, the module name is necessary')
        }
    }

    /**
     * 更新全局headers
     * 
     * @param  {...any} rest 
     */
    setHeader(...rest) {
        if (rest.length == 1 && typeof rest == 'object') {
            for (key of Object.keys(rest[0])) {
                this.globalConfig.headers[key] = rest[0][key]
            }
        }
        else if (rest.length == 2) {
            this.globalConfig.headers[rest[0]] = rest[1]
        }
        else {
            throw new Error('the maximum length of arguments is 2, if there is only one, it must be object ')
        }
        return this
    }
}

module.exports = {
    ApiModule,
    axios
}