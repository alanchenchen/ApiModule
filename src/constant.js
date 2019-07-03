const DYNAMICROUTER_PATTERN_FLAG = 'pattern'

module.exports = {
    /**
     * @constant {string} DYNAMICROUTER_PATTERN_FLAG 动态路由参数用来替换占位符的标志位，指定占位符标志位是字符串pattern
     * @constant {string} DEFAULT_DYNAMICROUTER_RPATTERN 插件动态路由参数的默认占位符
     * @constant {string} MODULE_PATTERN 表面当前请求url是模块的占位符，默认为->
     * @constant {object} DEFAULT_BASECONFIG 插件的请求默认配置项
     */
    DYNAMICROUTER_PATTERN_FLAG,
    DEFAULT_DYNAMICROUTER_RPATTERN: `:${DYNAMICROUTER_PATTERN_FLAG}`,
    MODULE_PATTERN: '->',
    DEFAULT_BASECONFIG: {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
}