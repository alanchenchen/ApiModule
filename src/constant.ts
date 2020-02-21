import { RequestModuleConfig } from "./type";

/**
 * 动态路由参数用来替换占位符的标志位，指定占位符标志位是字符串pattern
 */
export const DYNAMICROUTER_PATTERN_FLAG: string = "pattern";

/**
 * 插件动态路由参数的默认占位符
 */
export const DEFAULT_DYNAMICROUTER_RPATTERN: string = `:${DYNAMICROUTER_PATTERN_FLAG}`;

/**
 * 表明当前请求url是模块的占位符，默认为->
 */
export const MODULE_PATTERN: string = "->";

/**
 * 插件的请求默认配置项
 */
export const DEFAULT_BASECONFIG: RequestModuleConfig = {
    method: "GET",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
}