const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const PATH_SRC = path.resolve(__dirname, 'src');
const PATH_DIST = path.resolve(__dirname, 'dist');
const PATH_NPM = [path.resolve(__dirname, 'node_modules')];
const PATH_NPM_CSS = [
  path.resolve(__dirname, 'node_modules', 'normalize.css'),
  path.resolve(__dirname, 'node_modules', 'ol'),
];
const PATH_NPM_SASS = [
];
const PATH_CSS = PATH_NPM_CSS.concat(PATH_SRC);
const PATH_SASS = PATH_NPM_SASS.concat(PATH_SRC);
const PATH_NPM_FONTS = [path.resolve(__dirname, 'node_modules', 'typeface-roboto', 'files')];
const PATH_FONTS = PATH_NPM_FONTS.concat(path.join(PATH_SRC, 'fonts'));
const PATH_NPM_IMAGES = [];
const PATH_IMAGES = PATH_NPM_IMAGES.concat(PATH_SRC);

const ruleBabelStatic = {
  test: /\.jsx?$/u,
  exclude: /node_modules/u,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: false,
      },
    },
  ],
  include: PATH_SRC,
};

const ruleTypescript = {
  test: /\.tsx?$/u,
  exclude: /node_modules/u,
  use: [
    {
      loader: 'ts-loader',
      options: {
        experimentalWatchApi: true,
        transpileOnly: true,
      },
    },
  ],
  include: PATH_SRC,
};

const cssModuleLoader = {
  loader: 'css-loader',
  options: { modules: false },
};

const cssTreeLoader = {
  loader: 'css-loader',
  options: { modules: true },
};

const cssLoader = {
  loader: 'css-loader',
};

const ruleWoff = {
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/u,
  use: [
    {
      loader: 'file-loader',
      options: {
        mimetype: 'application/font-woff',
        name: 'fonts/[name].[ext]',

        /*
         * node_modules/...
         *name: "[path][name].[ext]"
         */
      },
    },
  ],
  include: PATH_NPM,
};

const ruleTtf = {
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(ttf)(\?v=\d+\.\d+\.\d+)?$/u,
  use: [
    {
      loader: 'file-loader',
      options: {
        mimetype: 'application/font-ttf',
        name: 'fonts/[name].[ext]',

        /*
         * node_modules/...
         *name: "[path][name].[ext]"
         */
      },
    },
  ],
  include: PATH_FONTS,
};

const ruleEot = {
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(eot)(\?v=\d+\.\d+\.\d+)?$/u,
  use: [
    {
      loader: 'file-loader',
      options: {
        mimetype: 'application/font-eot',
        name: 'fonts/[name].[ext]',

        /*
         * node_modules/...
         *name: "[path][name].[ext]"
         */
      },
    },
  ],
  include: PATH_FONTS,
};

const ruleImages = {
  test: /\.(png|svg|jpg)$/u,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
      },
    },
  ],
  include: PATH_IMAGES,
};

const config = {
  entry: './src/index.tsx',
  module: {
    rules: [
      ruleWoff,
      ruleTtf,
      ruleEot,
      ruleImages,
    ],
  },
  resolve: {
    modules: [
      'src',
      'node_modules',
      path.join('node_modules', 'typeface-roboto', 'files'),
    ],
    extensions: [
      '.js',
      '.tsx',
      '.d.ts',
      '.ts',
      '.jsx',
    ],
    plugins: [new TsconfigPathsPlugin({ /* configFile: "./path/to/tsconfig.json" */ })],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ }),
    new HtmlWebpackPlugin({
      template: `${PATH_SRC}/index.ejs`,
      inject: true,
      hash: true,
      showErrors: true,
      appMountId: 'reactMount',
      title: 'Boilerplate',
      minify: {},
    }),
  ],
  output: {
    path: path.resolve(PATH_DIST),
    filename: 'index.js',
    publicPath: '/',
  },
};

module.exports = {
  PATH_DIST,
  config,
  ruleBabelStatic,
  ruleTypescript,
  cssLoader,
  cssModuleLoader,
  PATH_CSS,
  PATH_SASS,
};
