const { merge } = require('webpack-merge'); // mergey JS objects utility
const webpack = require('webpack');

const { config: baseConfig, PATH_DIST, PATH_CSS, PATH_SASS, cssLoader, cssModuleLoader, ruleTypescript } = require('./webpack.config-common');

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
    occurrenceOrder: true,
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
