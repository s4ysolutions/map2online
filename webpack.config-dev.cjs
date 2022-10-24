/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const {
  config: baseConfig,
  PATH_CSS,
  PATH_SASS,
  cssLoader,
  cssModuleLoader,
  ruleTypescriptDev,
} = require('./webpack.config-common.cjs');

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
      ruleTypescriptDev,
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new ReactRefreshWebpackPlugin(),
  ],
  devServer: {
    //contentBase: path.resolve(__dirname, PATH_DIST),
    compress: false,
    port: 9000,
    hot: true,
    //publicPath: '/',
    historyApiFallback: true,
  },
});

require('./webpack.log.cjs')(config);
module.exports = config;
