module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageDirectory: './coverage/jest',
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.interface.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/app.config.ts',
    '!src/app/**/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['html', 'text-summary', 'lcov'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  // Gate CI à 70 % (seuil projet). Ambition de génération : ~80 %.
  coverageThreshold: {
    global: { statements: 70, branches: 70, lines: 70, functions: 70 },
  },
};
