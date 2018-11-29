import axios from 'axios'

export {
    axios
}

export default class ApiModule {
    constructor(globalConfig) {
        this.init(globalConfig)
    }
    //初始化全局配置
    init(globalConfig) { 
        //默认配置参数
        const baseConfig = {
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        //用户传入的全局配置参数和默认参数合并
        this.globalConfig = {...baseConfig, ...globalConfig}
    }
    //axios核心方法
    _base( url, data, config ) {
        const isJson = config.headers['Content-Type'] == 'application/json'
        const isDynamicRouter = Boolean(config.dynamicRouter)
        const isStaticRouter = !Boolean(config.dynamicRouter)
        const method = config.method.toLowerCase()
        let _url, _data

        // 先区分是动态路由还是静态路由请求
        if(isDynamicRouter) {
            if(typeof data == 'string' || typeof data == 'number') {
                _url = `${url}/${data}`
                _data = {}
            }
            else {
                throw new Error('when you use dynamicRouter GET request, data must be a string or number')
            }
        }
        else if(isStaticRouter) {
            _url = url
            if(Boolean(data) && typeof data != 'object') {
                throw new Error('ivalid data,data must object')
            }
            // 再区分是get(传params)还是post请求(传data)
            _data = method == 'get'
                        ? { params: data}
                        : { data }
        }
        
        return axios({
            url: _url,
            ..._data,
            ...config,
            // 当method为put、post等时将data以formData或json编码格式传递
            transformRequest: [function (data) {
                let ret = ''
                for (let it in data) {
                    ret += '&'+encodeURIComponent(it) + '=' + encodeURIComponent(data[it])
                }
                const result = isJson? JSON.stringify(data): ret.substring(1)
                return result
            }]
        })
    }
    //暴露出去的api方法
    createApi(apiConfig) {
        if(Object.prototype.toString.call(apiConfig) != '[object Object]') {
            throw new Error('ivalid param, the param must be Object')
        }
        else {
            this.api = (type,data) => {
                const { url, ...rest} = apiConfig[type]
                //单独接口的配置参数和全局配置合并
                const config = { ...this.globalConfig, ...rest }
                return this._base(url, data, config)
            }
            return this.api  
        }
    }

    // createApiCover() {
        
    // }
}