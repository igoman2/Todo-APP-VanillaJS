const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./src/index.js",
  output: {
    filename: "dev.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  devServer: {
    compress: true, // 모든 항목에 대해 gzip압축 사용
    hot: true, // HRM(새로 고침 안해도 변경된 모듈 자동으로 적용)
    port: 4000, // 접속 포트 설정
  },
  plugins: [
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
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
