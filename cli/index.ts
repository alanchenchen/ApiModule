/**
 * @module 调用npm命令的主要逻辑模块
 * @param {String} g 生成一个package.json缓存文件
 * @param {String} rm 删除已有的package.json缓存文件
 * @param {String} d 将缓存文件覆盖源package.json
 * @param {String} h 查看命令参数帮助
 */
import fs from "fs";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import { flag, output } from "@alanchenchen/commandlineflag";
import generate from "./commands/generate";
import deploy from "./commands/deploy";
import remove from "./commands/remove";

const ROOTPATH = process.cwd();
const config = yaml.safeLoad(fs.readFileSync(path.join(ROOTPATH, "config/lib.config.yml"), "utf8"));
const sourcePath = path.join(ROOTPATH, "package.json");
const copyPath = path.join(__dirname, "temporary.json");

const program = flag();
const doc = output();

doc.writeUsage("config <command>", "auto config library configs to package.json");
const generateDesc = chalk.yellow("generate the temporary.json, if there is already one it will be overlapped");
const removeDesc = chalk.yellow("remove the temporary.json");
const deployDesc = chalk.yellow("apply the temporary.json to root path");

program
    .inject(doc)
    .command("g", generateDesc, () => generate(sourcePath, copyPath, config))
    .command("rm", removeDesc, async() => await remove(copyPath))
    .command("d", deployDesc, async() => await deploy(sourcePath, copyPath))
    .command("h", deployDesc, () => doc.render())
    .version(config.version)
    .run();