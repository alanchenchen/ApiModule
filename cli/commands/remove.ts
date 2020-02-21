import fs from "fs";
import chalk from "chalk";
import checkJSONExist from "../utils";

/**
 * 删除缓存文件
 * 
 * @param copyPath 缓存文件路径
 */
export default async(copyPath: string) => {
    try {
        await checkJSONExist(copyPath);
        fs.unlink(copyPath, (err: Error) => {
            if (err) {
                console.log(chalk`{yellow package.json缓存文件删除失败}`);
            }
            else {
                console.log(chalk`{green package.json缓存文件删除成功！}`);
            }
        });
    } catch (error) {
        console.log(chalk`{red ${error}}`);
    }
}