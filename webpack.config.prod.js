const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "prod.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    library: {
      name: "MyTodo",
      type: "umd",
    },
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      meta: {
        // meta 태그를 추가
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
      hash: true, // 모든 스크립트, css 파일에 고유한 컴파일 해시 추가하여 캐시를 무효화
      showErrors: true, // 오류 정보가 html에 기록됨
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
};
