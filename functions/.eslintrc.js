module.exports = {
  env: {
      es6: true,
      node: true, // Ensures Node.js global variables and Node.js scoping is used
  },
  parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
  },
  extends: [
      "eslint:recommended", // Use recommended configurations
  ],
  rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", {"allowTemplateLiterals": true}],
  }
};
