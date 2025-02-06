module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': [
      'warn',
      {
        tabWidth: 2,
        singleQuote: true,
        semi: false,
        bracketSpacing: false,
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
    'no-unused-vars': 'warn',
    'no-shadow': 'off',
    'no-return-await': 'off',
    quotes: ['error', 'single'],
  },
}
