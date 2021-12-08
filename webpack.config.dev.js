const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "eval",
  entry: "./src/index.js",
  output: {
    filename: "dev.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  devServer: {
    compress: true,
    hot: true,
    port: 4000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      hash: true,
      showErrors: true,
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
