require( "@babel/polyfill");
const register = require('@babel/register');
register({
  extensions: ['.ts', '.js']
});