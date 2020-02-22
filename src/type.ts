import { AxiosRequestConfig, AxiosPromise, AxiosStatic } from "axios";

/**
 * 插件预先配置.
 */
export declare interface PreConfig {
    dynamicRouterPattern: string;
}

/**
 * 插件在axios的request参数基础上新增一个dynamicRouter.
 */
export declare interface RequestModuleConfig extends AxiosRequestConfig {
    dynamicRouter?: boolean;
}

/**
 * 模块api配置对象.
 */
export declare type ApiConfig = {
    [T: string] : RequestModuleConfig;
}

export declare interface ModuleApiConfig {
    name: string;
    module: ApiConfig;
}

/**
 * 插件的request方法参数.
 */
export declare interface RequestConfig {
    url: string,
    data?: any,
    dynamicRouterParams?: object,
    module?: string
}

/**
 * 插件的request方法.
 */
export declare type RequestHandler = AxiosStatic

export declare type ResponsePromise = AxiosPromise<any>