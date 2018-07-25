var path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')//压缩混淆

module.exports = {
    entry: {
        ApiModule: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'ApiModule',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,//打包js，转码ES6
                exclude: /(node_modules|bower_components)/,
                include: path.join(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'stage-3']
                    }
                }
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({//压缩混淆代码，并且生成sourceMap调试
            uglifyOptions: {
                ecma: 8,//支持ECMA 8语法
                warnings: false//去掉警告
            },
            sourceMap: false
        })
    ]
}