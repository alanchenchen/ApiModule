# ApiModule

![](https://img.shields.io/npm/v/api-module.svg)
![](https://img.shields.io/npm/dt/api-module.svg)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

> 基于axios二次封装，为了解决RESTFUL接口冗余问题的一种前端工程化尝试

> version:  0.2.0

> lastDate: 2020/2/21

> Author:  Alan Chen

## Features
1. 以axios作为基础库，完全基于axios的api使用方法。
2. 模块化管理各个RESTFUL接口的配置。
3. 预先提供全局配置，也可以在每个RESTFUL接口具体配置，出现重复配置时以具体接口配置优先处理。
4. 统一请求参数的格式，支持请求后台动态路由，支持多个路由参数动态传入。`任何请求方式都支持动态路由参数!`
5. 每个接口除了data以外，支持axios的config所有配置。新增一个dynamicRouter配置项作为是否启用动态路由接口的标识。

## Why
* 在开发前端页面过程中，势必会因为一堆RESTFUL接口的管理带来麻烦，举个例子，目前一个项目已经存在30个接口，如果需要更改a接口的timeout或者method，大家肯定会直接去具体的api调用函数里更改，但是假设api函数所在页面的代码量过于多，定位到准确位置怕是会耗费不少时间。
* 目前axios使用大概分成两种：
    1. 直接使用`axios.get(url, configs)`或者`axios.post(url, data, configs)`这类方法，这样会存在很大的问题，给具体接口配置request headers和timeout会非常麻烦
    2. 使用`axios(url, confings)`或者`axios.defaults`搭配`axios.create(configs)`来预设全局配置，这种比第一种要好很多，但是还是会遇到具体接口配置的问题
### ApiModule是怎么做的
ApiModule是在第二种使用方法上进行优化，在`new ApiModule(configs)`的同时会调用`axios(url, configs)`生成一个全局配置后的axios方法。然后所有的具体接口会写在另外一个模块里，每个接口都可以配置自己的request headers和timeout等等。导入接口模块后，再调用实例的`createApi()`方法，就会返回一个函数，只需要在需要请求接口的地方调用该函数即可。对具体接口所有的配置，与该函数无关，只在接口模块里进行修改即可。

## Installatiom
1. npm安装 
```js
    npm install api-module --save
```
或
```js 
    yarn add api-module
```
2. script 引入。ApiModule直接挂载在windows对象下
```html
    <script src="node_modules/api-module/dist/ApiModule.js"></script>
```

## Usage Help
1. npm包默认导出ApiModule核心类。命名导出axios为axios本身，可以用来做拦截
2. ApiModule构造函数可选两个参数，参数一是对象globalConfig，作为接口的全局配置传入。参数二是对象preConfigs，目前支持一个dynamicRouterPattern的key，用作动态路由的占位符规则。。格式如下：
    ```js
        // 与axios的原有config完全一致
        {
            baseURL: 'http://127.0.0.1:7070',
            timeout: 5000
        },
        {
            dynamicRouterPattern: ':pattern' // 插件的动态路由url参数默认以：开头
        }
    ```
3. ApiModule实例有4个方法：
    * registerModule({name, module})，注册模块作用域config。name为string，module格式与config一致，均必选。如果调用了该方法，则表示module内的config存入自己模块的作用域内，这样就避免了命名冲突。函数返回ApiModule实例。支持链式调用。
    * registerGlobal(config)，注册全局作用域cofnig。config格式与globalConfig一致，可选，如果传入了config，则当前config会存入插件的全局作用域。支持链式调用。
    * setHeader(headers)，更新全局配置的请求头，更新后，所有的请求都会合并新的全局请求头信息。参数最多有两个，当只有一个参数时，必须为Object，当有两个参数时，参数一是key，参数二是value。函数返回ApiModule实例，setHeader支持链式调用。
    * request(config)，发出请求，返回axios的结果。config是个对象，格式如下：
        * url `[String]`，必选，config中的key名，不是config中的url
        * data `[Object]`，可选，axios的data参数，作为请求头query或请求体
        * dynamicRouterParams `[Object]`，可选，当config中dynamicRouter为true时必选。动态路由的参数，插件为了更好的使用动态路由，提供了路由参数选项。格式见下文
        * module `[String]`，可选，指定使用哪个模块的config
5. 使用如下：
    * api.js
    ``` javascript
        import ApiModule from 'api-module' //导入ApiModule
        import { apiConfig, globalConfig } from 'config' //导入全局作用域接口
        import moduleA from 'moduleA' //导入模块作用域接口
        import moduleB from 'moduleB' //导入模块作用域接口

        const api = new ApiModule(globalConfig);
        api.registerModule({name: 'A', module: moduleA})
           .registerModule({name: 'B', module: moduleB})
           .registerGlobal(apiConfig);
        //导出api函数
        export default api.request;
    ```
    * 业务模块，例如 login.js。直接使用api({url, data, dynamicRouterParams}即可)
    ``` javascript
         //get请求无参数
        api({
            url: 'login',
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

        //get请求有参数
        api({
            url: 'login',
            data: { username: 'alan' } //参数直接以对象传入,已对axios做过处理，不需要加入params的key。无参数可以不填
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

        //PUT请求，且是动态路由接口。最终的url路径为'sign/logout/name/alan/date/2018-12-4',请求体是{username: 'alan'},格式为form表单编码
        api({
            url: 'logout',
            data: { username: 'alan' }, //参数直接以对象传入。无参数可以不填
            dynamicRouterParams: { name: 'alan', date: '2018-12-4' } //路由参数必须是Object类型，不能忽略参数，否则会抛出异常
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })
            
        //POST请求有参数
        api({
            url: 'setRoleAccess',
            data: { username: 'alan', access: 'admin' } //参数直接以对象传入。无参数可以不填
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })
    ```

6. 插件同时也导出了`axios`。方便使用axios自带的拦截器功能。
```javascript
    import { axios } from 'api-module'

    // 原生axios的拦截器
    axios.interceptors.request.use(function (config) {
        // 在发送请求之前做些什么
        console.log('你被拦截啦！！')
        return config
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error)
    })
```

## Example
[example](./example/client.js)


## Attentions

1. 插件本身预设了几个配置项，如果不做任何设置，默认是get请求，Content-Type默认是application/x-www-form-urlencoded编码。
2. 使用此插件可以最大程度解耦RESTFUL接口和具体业务，开发者只需要用接口地址别名请求，而需要更改接口配置时，不用知道在哪个页面调用了此接口，只需要将注意点放在apiConfig。
3. 此插件可以在任何框架中使用，无需安装axios，已经集成在内，我本人在vue框架内使用，如果觉得在每个组件内引入api模块比繁琐，可以在`main.js`导入，然后挂载在`vue.prototype`上。
4. 至于插件接口的配置项，直接去看axios文档，与axios函数的第二个参数config完全一致。
5. 构造器函数的第二参数dynamicRouterPattern支持自定义占位符重写，但是必须是字符串，而且必须要包含pattern。比如： {pattern}、@pattern。注意字符串内不允许出现正则表达式的特定符号，比如$、^等。

## license
* Anti 996(996.ICU)