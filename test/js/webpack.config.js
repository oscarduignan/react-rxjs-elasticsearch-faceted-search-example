var path = require('path');
var webpack = require('webpack');

module.exports = {

  entry: [
    './search/PaginationSpec.js',
  ],

  output: {
    path: './',
    filename: 'specs.js',
    publicPath: '/'
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },

  resolve: {
    extensions: ["", ".js", ".jsx"],
  },

};