import svelte from "rollup-plugin-svelte";
import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import analyzer from "rollup-plugin-analyzer";
import progress from "rollup-plugin-progress";
import commonjs from "rollup-plugin-commonjs";
import json from "@rollup/plugin-json";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import clear from 'rollup-plugin-clear';

import pkg from "./package.json";

/**
 * 因为ts的很多插件对svelte、vue框架兼容报错，只有rollup-plugin-typescript兼容。
 * 但是只有rollup-plugin-typescript2会生成对应的type文件。
 * 所以对于不同的npm包，采用不同的ts来打包，当开发纯js逻辑的包时，生成type文件，点当开发框架的包时，只兼容打包，不生成type文件。
 */
let ts;
if (pkg.useFrame === true) {
    ts = require("rollup-plugin-typescript")();
} else {
    ts = require("rollup-plugin-typescript2")({
        verbosity: 2,
        clean: true,
    });
}

const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, "$3")
    .replace(/^\w/, m => m.toUpperCase())
    .replace(/-\w/g, m => m[1].toUpperCase());

export default {
    input: "src/index.ts",
    output: [
        { file: `${pkg.module}`, format: "es" },
        { file: `${pkg.main}`, format: "umd", name: "ApiModule" }
    ],
    plugins: [
        clear({
            targets: ['dist']
        }),
        globals(),
        builtins(),
        json(),
        resolve(),
        commonjs(),
        ts,
        svelte({
            emitCss: true
        }),
        css(),
        vue({
            exclude: ["node_modules"],
            css: false
        }),
        terser({
            format: {
                comments: "some",
            },
        }),
        progress(),
        analyzer({
            // hideDeps: true,
            filter: []
        })
    ],
    external: ["vue"]
};