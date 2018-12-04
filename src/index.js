/**
 * @name ApiModule
 * @author Alan chen 
 * @since 2018/12/4
 * @license MIT
 */
import axios from 'axios'

export {
    axios
}

export default class ApiModule {
    constructor(globalConfig) {
        this.init(globalConfig)
    }
    // 初始化全局配置
    init(globalConfig) { 
        /* 默认配置参数 */
        const baseConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        /* 用户传入的全局配置参数和默认参数合并 */
        this.globalConfig = {...baseConfig, ...globalConfig}
    }
    // axios核心方法
    _base( url, data, dynamicRouterParams, config ) {
        const isDynamicRouter = Boolean(config.dynamicRouter)
        const method = config.method.toUpperCase()
        let _data = {}, _url = url

        /* 先区分是动态路由还是静态路由请求 */
        if(isDynamicRouter) {
            if(Object.prototype.toString.call(dynamicRouterParams) == '[object Object]') {
                /* 将动态路由参数中的占位符替换成请求中的路由参数 */
                Object.entries(dynamicRouterParams).forEach(item => {
                    const rule = new RegExp(`(\:${item[0]})`, 'g')
                    _url = _url.replace(rule, item[1])
                })
            }
            else {
                throw new Error('when you use dynamicRouter params request, data must be an object')
            }
        }

        if(Boolean(data)) {
            if(Object.prototype.toString.call(data) != '[object Object]') {
                throw new Error('ivalid data,data must object')
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
                            ret += '&'+encodeURIComponent(it) + '=' + encodeURIComponent(data[it])
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
    // 暴露出去的api方法
    createApi(apiConfig) {
        if(Object.prototype.toString.call(apiConfig) != '[object Object]') {
            throw new Error('ivalid param, the param must be Object')
        }
        else {
            /**
             * @function 插件暴露出去的方法，参数是一个对象
             * @param {String} url apiConfig中的key名
             * @param {Object} data 请求的内容，可以是请求头中的queryString键值对，也可以是请求体的内容
             * @param {Object} dynamicRouterParams 动态路由参数，键值对。
             */
            this.api = ({url: name, data, dynamicRouterParams}) => {
                const { url, ...rest} = apiConfig[name]
                /* 具体接口的配置参数和全局配置合并 */
                const config = { ...this.globalConfig, ...rest }
                return this._base(url, data, dynamicRouterParams, config)
            }
            return this.api  
        }
    }

    // createApiCover() {
        
    // }
}