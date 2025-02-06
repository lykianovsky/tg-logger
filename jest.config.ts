import type {Config} from 'jest'

const config: Config = {
  preset: 'ts-jest', // Используем ts-jest для работы с TypeScript
  testEnvironment: 'node', // Устанавливаем окружение для тестов
  moduleNameMapper: {
    '^@rest/(.*)$': '<rootDir>/src/rest/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@internal-types/(.*)$': '<rootDir>/src/internal-types/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Исключаем ненужные папки
  clearMocks: true, // Автоматическая очистка моков
}

export default config
