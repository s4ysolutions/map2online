module.exports = {
  // Extend existing configuration
  // from ESlint and eslint-plugin-react defaults.
  "parser": "@typescript-eslint/parser",
  extends:  [
    "eslint:all",
    "plugin:react/all",
    "plugin:react-perf/recommended",
    "plugin:@typescript-eslint/recommended"
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
  },
  "env": {
    "amd": true,
    "es6": true,
    "browser": true,
    "jest": true,
    "node": false
  },
  // Enable custom plugin known as eslint-plugin-react
  "plugins": [
    "react","async-await", "react-perf", "react-hooks"
  ],
  "rules": {
    "react-perf/jsx-no-new-function-as-prop": "off",
    "react/forbid-component-props": "off",
    "react/prefer-stateless-function": "off",
    "react/no-set-state": "error",
    "react/jsx-handler-names": "off",
    "react/jsx-wrap-multilines": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-closing-bracket-location": "off",
    "react/jsx-max-depth": "off",
    "react/jsx-no-bind": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".tsx"] }],
    "react/jsx-sort-default-props": "error",
    "react/jsx-max-props-per-line": [1, { "when": "multiline" }],
    "react/jsx-indent-props": ["error",2],
    "react/jsx-indent": "off",
    "react/require-default-props": "off",
    "react/forbid-prop-types": "off",
    "react/no-multi-comp": "off",
    "react/prop-types": "off",
    "react/sort-prop-types": "error",
    "react/jsx-sort-props": "error",
    "react/jsx-no-literals": "off",
    "space-before-function-paren": "off",
    "react/destructuring-assignment": "error",
    "no-warning-comments": "off",
    "function-call-argument-newline": "off",
    "no-multi-assign": "off",
    "no-plusplus": "off",
    "max-params": "off",
    "max-depth": "off",
    "semi-style": "off",
    "capitalized-comments": "off",
    "arrow-parens": "off",
    "multiline-ternary": "off",
    "no-undefined": "off",
    "no-mixed-operators": "off",
    "dot-location": "off",
    "no-confusing-arrow": "off",
    "no-nested-ternary": "off",
    "line-comment-position": "off",
    "no-inline-comments": "off",
    "no-extra-parents": "off",
    "no-multi-comp": "off",
    "init-declarations": "off",
    "no-ternary": "off",
    "max-len": "off",
    "max-lines": "off",
    "default-case": "off",
    "no-sequences": "off",
    "no-duplicate-imports": "off",
    "sort-imports": ["error",{
      "ignoreDeclarationSort": true,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
    }],
    "max-statements": "off",
    "one-var": "off",
    "id-length": "off",
    "quote-props": "off",
    "no-empty": "warn",
    "no-magic-numbers": ["error",{"ignore": [0,1]}],
    "padded-blocks": "off",
    "sort-keys": "error",
    "space-infix-ops": ["warn"],
    "require-await": "error",
    "no-return-await": "error",
    "async-await/space-after-async": 2,
    "async-await/space-after-await": 2,
    "indent": [ "warn", 2, {"SwitchCase": 1, "MemberExpression": "off"} ],
    "linebreak-style": [ "error", "unix" ],
    "quotes": [ "error", "single" ],
    "semi": [ "error", "always" ],
    "no-console": [ "warn" ],
    "no-unused-vars": [ "warn" ],
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": [ "warn", { "before": false, "after": true } ],
    "key-spacing": [ "warn", { } ],
    "consistent-return": "error",
    "object-curly-spacing": "off",
    "no-underscore-dangle": ["off"],
    "@typescript-eslint/indent": ["error", 2],
    "max-classes-per-file": "off",
    "react/jsx-fragments": "off",
    "implicit-arrow-linebreak": "off",
    "array-element-newline": "off",
    "object-property-newline": "off",
    "lines-around-comment": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "globals": {
    "_": true,
    "__dirname": true,
    "module": true,
    "nocker": true,
    "nock": true,
    "vaultConfig": true,
    "delay": true,
    "vaultObservable": true,
    "storeFactory": true,
    "rootEpic": true,
    "assert": true,
    "initVault": true,
    "react-hooks/rules-of-hooks": "readonly",
    "react-hooks/exhaustive-deps": "readonly"
  },
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
      // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "16.0", // React version, default to the latest React stable release
    },
    "propWrapperFunctions": [ "forbidExtraProps" ] // The names of any functions used to wrap the
    // propTypes object, e.g. `forbidExtraProps`.
    // If this isn't set, any propTypes wrapped in
    // a function will be skipped.
  }
};
// set filetype=javascript
