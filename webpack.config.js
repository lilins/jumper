const webpack = require('webpack')
const path = require('path')
// const commonsPlugin = new webpack.optimize.CommonsChunkPlugin('index.js')
const HotModuleReplacement = new webpack.HotModuleReplacementPlugin()
// const DefinePlugin = new webpack.DefinePlugin({
//     "process.env": {
//         NODE_ENV: JSON.stringify("production")
//     }
// })

module.exports = {
    //页面入口文件配置
    entry: {
        index: './src/index.js'
    },
    //入口文件输出配置
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    module: {
        //加载器配置
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'babel-preset-stage-2', 'react']
                }
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap' },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
        ]
    },
    //插件项
    plugins: [
        // commonsPlugin,
        HotModuleReplacement
    ],
    //其它解决方案配置
    resolve: {
        // root: path, //绝对路径
        extensions: ['.js', '.json', '.scss'],
        alias: {
            src: path.resolve(__dirname, 'src')
        }
    }
};
