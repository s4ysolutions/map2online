const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const {
  config: baseConfig,
  PATH_DIST,
  PATH_CSS,
  PATH_SASS,
  cssLoader,
  cssModuleLoader,
  ruleTypescript,
} = require('./webpack.config-common');

const ruleCssEmbed = {
  test: /\.css$/u,
  use: [
    'style-loader',
    cssLoader,
  ],
  include: PATH_CSS,
};

const ruleSassEmbed = {
  test: /\.s(a|c)ss$/u,
  use: [
    'style-loader',
    cssModuleLoader,
    'sass-loader',
  ],
  include: PATH_SASS,
};

const config = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  // devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      ruleCssEmbed,
      ruleSassEmbed,
      ruleTypescript,
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, PATH_DIST),
    compress: false,
    port: 9000,
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
  },
});

require('./webpack.log')(config);
module.exports = config;
