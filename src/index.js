import axios from 'axios'

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
        const method = config.method
        //区分是传params还是data
        let _data = method == 'get'
                    ? { params: data}
                    : { data }
        
        return axios({
            url,
            ..._data,
            ...config,
            //将data以formData编码格式传递
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
                const { url, ...api} = apiConfig[type]
                //单独接口的配置参数和全局配置合并
                const config = { ...this.globalConfig, ...api }
                // console.log(config)
                return this._base(url, data, config)
            }
            return this.api  
        }
    }

    // createApiCover() {
        
    // }
}