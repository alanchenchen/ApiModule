import fs from "fs";
import chalk from "chalk";
import { prompt } from "inquirer";
import checkJSONExist from "../utils";

/**
 * 覆盖源package.json
 * 
 * @param sourcePath 源package.json路径
 * @param copyPath 缓存文件路径
 */
export default async (sourcePath: string, copyPath: string) => {
    try {
        const { deposit } = await prompt([
            {
                type: "list",
                name: "deposit",
                message: chalk.green("此操作将会用缓存文件覆盖根目录下的package.json"),
                choices: [
                    { name: "执行", value: true, short: chalk.green("覆盖") },
                    { name: "取消", value: false, short: chalk.red("取消") }
                ]
            }
        ]);

        if (deposit) {
            await checkJSONExist(copyPath);
            fs.rename(copyPath, sourcePath, (err: Error) => {
                if (err) {
                    console.log(chalk`{yellow package.json文件覆盖失败}`);
                }
                else {
                    console.log(chalk.bgBlue(`package.json文件覆盖成功！ 可以使用npm run build打包，然后npm publish发布`));
                }
            });
        }
    } catch (error) {
        console.log(chalk`{red ${error}}`);
    }
}