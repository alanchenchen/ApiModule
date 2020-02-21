import fs from "fs";
import chalk from "chalk";

/**
 * 读取源package.json，然后修改，写入新的json到一个缓存文件
 * 
 * @param sourcePath 源package.json路径
 * @param copyPath 缓存文件路径
 * @param config 配置对象
 */
export default (sourcePath: string, copyPath: string, config: any) => {
    const version = config.version || "0.0.1";
    const keywords = config.keywords || [];
    const author = config.author || "Alan Chen";
    const nodeVersion = config.nodeVersion || process.version;
    const license = config.license || "MIT";

    fs.readFile(sourcePath, "utf8", (err: Error, data: string) => {
        if (err) {
            console.log(chalk`{yellow package.json源文件读取失败}`);
        }
        let copyPackageJson = JSON.parse(data);

        copyPackageJson.name = config.libraryName;
        copyPackageJson.version = version;
        copyPackageJson.description = config.description;
        copyPackageJson.main = `dist/${config.bundleName}.js`;
        copyPackageJson.module = `dist/${config.bundleName}.mjs`;
        copyPackageJson.keywords = keywords;
        copyPackageJson.author = author;
        copyPackageJson.license = license;
        copyPackageJson.repository = config.repository;
        copyPackageJson.homepage = config.repository.url;
        copyPackageJson.bugs = {
            url: `${config.repository.url}/issues`,
            email: config.email
        }
        copyPackageJson.engines = {
            node: `>= ${nodeVersion}`
        }

        const newJson = JSON.stringify(copyPackageJson, null, 2); //格式化输出json文件

        fs.writeFile(copyPath, newJson, (err: Error) => {
            if (err) {
                console.log(chalk`{yellow package.json缓存文件写入失败}`);
            }
            else {
                console.log(chalk.green(`package.json缓存文件写入成功！`));
            }
        });
    });
}