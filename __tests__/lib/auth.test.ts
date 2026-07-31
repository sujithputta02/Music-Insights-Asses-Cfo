import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth';

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword('', hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: 'user123', email: 'test1@example.com' };
      const payload2 = { userId: 'user456', email: 'test2@example.com' };
      
      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it('should reject empty token', () => {
      const decoded = verifyToken('');
      
      expect(decoded).toBeNull();
    });

    it('should reject tampered token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = verifyToken(tamperedToken);
      
      expect(decoded).toBeNull();
    });
  });

  describe('Integration: Full auth flow', () => {
    it('should complete full auth flow', async () => {
      // 1. Hash password
      const password = 'SecurePass123!';
      const hashedPassword = await hashPassword(password);
      
      // 2. Verify password
      const isPasswordValid = await verifyPassword(password, hashedPassword);
      expect(isPasswordValid).toBe(true);
      
      // 3. Generate token
      const user = { userId: 'user123', email: 'user@example.com' };
      const token = generateToken(user);
      
      // 4. Verify token
      const decoded = verifyToken(token);
      expect(decoded?.userId).toBe(user.userId);
      expect(decoded?.email).toBe(user.email);
    });
  });
});
