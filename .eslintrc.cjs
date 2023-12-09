module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended'],
  plugins: [
    '@stylistic/js'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        'src/**/*.js'
      ],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    requireConfigFile: false,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    babelOptions: {
      babelrc: false,
      configFile: false
      // your babel options
      // presets: ["@babel/preset-env"],
    }
  },
  rules: {
    'no-console': 1,
    'no-lonely-if': 1,
    'no-unused-vars': 1,
    'no-trailing-spaces': 1,
    'no-multi-spaces': 1,
    'no-multiple-empty-lines': 1,
    'space-before-blocks': ['error', 'always'],
    'object-curly-spacing': [1, 'always'],
    '@stylistic/js/indent': ['error', 2],
    '@stylistic/js/no-extra-semi': 'error',
    '@stylistic/js/quotes': ['error', 'single'],
    'array-bracket-spacing': 1,
    'linebreak-style': 0,
    'no-unexpected-multiline': 'warn',
    'keyword-spacing': 1,
    'comma-dangle': 1,
    'comma-spacing': 1,
    'arrow-spacing': 1
  }
}
