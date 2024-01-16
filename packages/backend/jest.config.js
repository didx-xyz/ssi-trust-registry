module.exports = {
  moduleNameMapper: {
    '@ssi-trust-registry/(.+)': [
      '<rootDir>/../../packages/$1/src',
      '<rootDir>/../packages/$1/src',
      '<rootDir>/packages/$1/src',
    ],
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
}
