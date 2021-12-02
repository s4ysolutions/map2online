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

const { merge } = require('webpack-merge'); // mergey JS objects utility
const webpack = require('webpack');

const { config: baseConfig, PATH_DIST, PATH_CSS, PATH_SASS, cssLoader, cssModuleLoader, ruleTypescript } = require('./webpack.config-common.cjs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ruleSassExtract = {
  test: /\.s(a|c)ss$/,
  use: [
    MiniCssExtractPlugin.loader,
    cssModuleLoader,
    'sass-loader',
  ],
  include: PATH_SASS,
};

const ruleCssExtract = {
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    cssLoader,
  ],
  include: PATH_CSS,
};

const config = merge(baseConfig, {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  optimization: {
    removeAvailableModules: true,
    mergeDuplicateChunks: true,
    concatenateModules: true,
    minimize: true,
  },
  module: {
    rules: [ruleCssExtract, ruleSassExtract, ruleTypescript],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new CompressionPlugin({
      test: /\.js$|\.css$/,
      filename: '[file].gz',
      algorithm: 'gzip',
      threshold: 512,
      deleteOriginalAssets: false, // for sake of stats
      minRatio: 0.9, // Infinity
    }),
    new MiniCssExtractPlugin({
      /*
       * Options similar to the same options in webpackOptions.output
       * both options are optional
       */
      filename: 'styles.[contenthash].css',
      chunkFilename: '[id].css',
    }),
  ],
});

module.exports = config;
