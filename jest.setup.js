// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-only'
process.env.DATABASE_URL = 'postgresql://test@localhost:5432/test_db'
process.env.GROQ_API_KEY = 'test-groq-api-key'
