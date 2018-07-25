# ApiModule
> 基于axios二次封装，为了解决RESTFUL接口冗余问题的一种前端工程化尝试

> version:  0.0.3

> Author:  Alan Chen

## Features
1. 以axios作为基础库，完全基于axios的api使用方法。
2. 模块化管理各个RESTFUL接口的配置。
3. 预先提供全局配置，也可以在每个RESTFUL接口具体配置，出现重复配置时以具体接口配置优先处理。

## Why
* 在开发前端页面过程中，势必会因为一堆RESTFUL接口的管理带来麻烦，举个例子，目前一个项目已经存在30个接口，如果需要更改a接口的timeout或者method，大家肯定会直接去具体的api调用函数里更改，但是假设api函数所在页面的代码量过于多，定位到准确位置怕是会耗费不少时间。
* 目前axios使用大概分成两种：
    1. 直接使用`axios.get(url, configs)`或者`axios.post(url, data, configs)`这类方法，这样会存在很大的问题，给具体接口配置request headers和timeout会非常麻烦
    2. 使用`axios(confings)`或者`axios.defaults`搭配`axios.create(configs)`来预设全局配置，这种比第一种要好很多，但是还是会遇到具体接口配置的问题
### ApiModule是怎么做的
ApiModule是在第二种使用方法上进行优化，在`new ApiModule(configs)`的同时会调用`axios(confings)`生成一个全局配置后的axios方法。然后所有的具体接口会写在另外一个模块里，每个接口都可以配置自己的request headers和timeout等等。导入接口模块后，再调用实例的`createApi()`方法，就会返回一个函数，开发者只需要在需要请求接口的地方调用该函数即可。对具体接口所有的配置，与该函数无关，只在接口模块里进行修改即可。

## Usage Help
1. `npm install api-module --save` or `yarn add api-module`。 或者直接script引入即可(ApiModule直接挂载在windows对象下)
2. 新建一个接口模块，导出一个对象。key是每个接口的别名(api函数的第一个参数)，value是一个对象，可选所有axios的配置项。例如：
``` javascript
    //接口模块 apiConfig.js
    export default {
        //登入接口
        login: {
            url: 'sign/login', //url为具体的接口名称
            timeout: 3000 //接口的超时处理时间
        },
        //登出接口
        logout: {
            url: 'sign/logout',
            timeout: 3000
        },
        //更改用户权限接口
        setRoleAccess: {
            url: 'role/queryAccess',
            method: 'post', //请求方式改为post
            headers: { 
                'Content-Type': 'application/json', //请求头的编码格式
                'Author': 'Alan' //自定义接口的请求头
            }
        }
    }

```
3. 建议新建一个模块作为api模块。然后`new ApiModule(globalConfig)`,globalConfig是全局配置，例如可以加入baseURL,method，content-type等。然后调用实例的`createApi(apiConfig)`方法，例如：
``` javascript
    //全局api函数模块 api.js
    import ApiModule from 'api-module' //导入ApiModule
    import apiConfig from 'apiConfig' //导入具体接口的模块

    const globalConfig = {
        baseURL: 'www.example.com' //预设所有接口的接口前缀
        timeout: 3000 //预设所有接口的超时处理时间是3s
    }

    export default new ApiModule(globalConfig).createApi(apiConfig) //导出api函数

```
4. 在其他需要调用接口的模块里直接使用`api(url, data)`即可
``` javascript
    //login 登陆模块 login.js
    import api from 'api'

    //get请求无参数
    api('login')
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

    //get请求有参数，参数直接以对象传入,已对axios做过处理，不需要加入params的key
    api('logout', {username: 'alan'})
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

    //post请求有参数，参数直接以对象传入
    api('setRoleAccess', {username: 'alan', access: 'admin'})
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

```

## Attentions

1. 插件本身预设了几个配置项，如果不做任何设置，默认是get请求，Content-Type默认是application/x-www-form-urlencoded编码。
2. 使用此插件可以最大程度解耦RESTFUL接口和具体业务，开发者只需要用接口地址别名请求，而需要更改接口配置时，不用知道在哪个页面调用了此接口，只需要将注意点放在apiConfig。
3. 此插件可以在任何框架中使用，无需安装axios，已经集成在内，我本人在vue框架内使用，如果觉得在每个组件内引入api模块比繁琐，可以在`main.js`导入，然后挂载在`vue.prototype`上。但是不建议这么做。

## To do

这个插件只是我从现有项目里抽离出来的一小部分，因为觉得一个项目一旦超过几十个接口就很难维护，所以抽出一个比较小的插件。我在vue里使用的接口配置就是插件的思路，但是加入了返回状态码的管理。因为在我的项目里，和后台约定过的code与返回的数据data可以分开操作。举个例子，所有接口都会返回code 0000或者0001，0000表示请求成功，0001表示请求失败(这里的code不是指http状态码)，在我需要操作返回数据前需要对用户操作做一个提示，那么我仅仅只需要操作code即可，所以我在项目里把对code的操作抽出来，然后写了个插件加载器。然后把对不同code的操作分别模块化处理，有对code做的提示框，有当code为0009时登陆超时直接跳回登陆页的模块....我原本准备在这个插件里集成这个功能，后来发现，每个项目和后台约定的返回数据格式千奇百怪，并且axios本身也继承了拦截器，所以以后会不会做看情况吧...
