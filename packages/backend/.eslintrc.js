module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Type is enforced by callers. Not entirely, but it's good enough.
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['jest.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
    },
  ],
}
