var path    = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  context: __dirname,
  entry: {
    main: [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      "./src/js/main.jsx",
      "./src/scss/bootstrap.scss"
    ],
    head: "./src/js/head.js",
  },
  module: {
    loaders: [
      { test: /\.js$/,     loader: "babel?optional[]=runtime&stage=1", exclude: /node_modules|bower_components/},
      { test: /\.jsx$/,    loader: "react-hot!babel?optional[]=runtime&stage=1", exclude: /node_modules|bower_components/},
      { test: /\.s?css$/,  loader: "style!css!autoprefixer?browsers=last 2 version!sass?includePaths[]=" + path.join(__dirname, "node_modules")},
      { test: /\.woff2?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/,    loader: "file-loader" },
      { test: /\.eot$/,    loader: "file-loader" },
      { test: /\.svg$/,    loader: "file-loader" },
    ]
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
    pathinfo: true,
    publicPath: "http://localhost:8080/"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    )
  ],
  resolve: {
    extensions: ["", ".js", ".jsx"],
    root: [
      path.join(__dirname, 'src', 'js'),
      path.join(__dirname, 'src', 'scss'),
      path.join(__dirname, 'bower_components'),
    ]
  },
};