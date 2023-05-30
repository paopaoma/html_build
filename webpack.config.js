
const { ProvidePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");
module.exports = {
  mode: "development",
  entry: { index: './src/index.js', login: './src/login.js' }, // 多入口文件
  output: {
    clean: true,
    path: path.resolve(__dirname, "build"), // 打包后文件名
    filename: "js/[name].js" // entry输出的文件名/路径
  },
  devServer: {
    static: { // webpack-server编译在在内存中
      directory: path.join(__dirname, 'build'),
    },
    port: 9000,
    hot: true,
    compress: true, // 打包后文件gzip压缩，浏览器在解压 哈哈哈内存里哦
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(), // css压缩
    ],
    splitChunks: {
      chunks: "all",
      minSize: 500 * 1024, // 依赖包超过300m就进行分离（node_modules内的包）
      name: "commom",
      cacheGroups: {
        jquery: {
          name: "jquery",
          test: /jquery\.js/,
          chunks: "all"
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 分离单独的css，从js中抽离
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            // 小于8kb的图片转base64
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: { // 图片打包后路径
          filename: "images/[name].[hash:8][ext]",
        },
      },
      {
        test: /\.ejs$/,
        loader: "ejs-loader",
        options: {
          esModule: false
        }
      }
    ],
  },
  plugins: [
    // 每个html模板及需要引入的js文件
    new HtmlWebpackPlugin({
      title: "首页",
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      title: "登陆",
      filename: "login.html",
      template: "./src/login.html",
      chunks: ["login"]
    }),
    new CopyPlugin({
      patterns: [ // 解决图片路径问题
        { from: path.resolve(__dirname, "./src/img"), to: path.resolve(__dirname, "./build/img") },
      ],
    }),
    // 仅在生产环境开启 CSS 优化
    new MiniCssExtractPlugin({
      // css打包后路径
      filename: "css/[name].[hash:8].css",
      chunkFilename: "css/[name].chunk.[hash:8].css",
    }),
    // 注入全局变量
    new ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    })
  ]
}