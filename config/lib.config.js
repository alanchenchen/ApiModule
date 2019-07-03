/**
 * @module 配置package.json的参数和webpack.config的参数。
 * 
 */
module.exports = {
    libraryName: 'api-module', // npm包名，首字母不允许大写，支持驼峰和短杆写法
    bundleName: 'ApiModule', // 打包后文件名，也是UMD script直接引入挂在windows对象的key名
    version: '0.1.1', // 版本号
    description: 'A solution to use axios with configs separated to modules', // 包描述
    keywords: ['axios', 'module'], // 关键词
    author: 'Alan Chen', // 作者
    email: "739709491@qq.com", // 用于bug反馈的邮箱
    repository: { // 仓库地址和首页地址
        type: 'git',
        url: 'https://github.com/alanchenchen/ApiModule'
    }
}