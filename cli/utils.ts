import fs from "fs";
import chalk from "chalk";

/**
 * 调用unlink删除文件和remae改变路径之前必须先用access检测文件是否存在
 */
export default (path: string) => {
    return new Promise((resolve: Function, reject: Function) => {
        fs.access(path, fs.constants.F_OK, (err: Error) => {
            if (err) {
                console.log(chalk`{yellow 没有发现package.json缓存文件,请先yarn/npm run config g 生成缓存文件}`);
            }
            else {
                resolve();
            }
        });
    });
}