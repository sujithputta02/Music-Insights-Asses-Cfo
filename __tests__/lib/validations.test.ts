import {
  registerSchema,
  loginSchema,
  addAlbumSchema,
  updateAlbumSchema,
} from '@/lib/validations';
import { ZodError } from 'zod';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Short1!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'lowercase123!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'NoNumbers!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'NoSpecial123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: '',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('addAlbumSchema', () => {
    it('should validate correct album data', () => {
      const validData = {
        appleCatalogId: 1234567890,
        title: 'Test Album',
        artistName: 'Test Artist',
        genre: 'Rock',
        releaseDate: '2024-01-01T00:00:00Z',
        trackCount: 12,
        artworkUrl: 'https://example.com/artwork.jpg',
        collectionPrice: 9.99,
      };

      const result = addAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate album with optional fields missing', () => {
      const validData = {
        appleCatalogId: 1234567890,
        title: 'Test Album',
        artistName: 'Test Artist',
      };

      const result = addAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Test Album',
      };

      const result = addAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid appleCatalogId type', () => {
      const invalidData = {
        appleCatalogId: 'not-a-number',
        title: 'Test Album',
        artistName: 'Test Artist',
      };

      const result = addAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative trackCount', () => {
      const invalidData = {
        appleCatalogId: 1234567890,
        title: 'Test Album',
        artistName: 'Test Artist',
        trackCount: -5,
      };

      const result = addAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAlbumSchema', () => {
    it('should validate rating update', () => {
      const validData = {
        userRating: 4,
      };

      const result = updateAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate notes update', () => {
      const validData = {
        userNotes: 'Great album!',
      };

      const result = updateAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate both rating and notes', () => {
      const validData = {
        userRating: 5,
        userNotes: 'Masterpiece!',
      };

      const result = updateAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject rating below 0', () => {
      const invalidData = {
        userRating: -1,
      };

      const result = updateAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const invalidData = {
        userRating: 6,
      };

      const result = updateAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject notes longer than 1000 characters', () => {
      const invalidData = {
        userNotes: 'a'.repeat(1001),
      };

      const result = updateAlbumSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept notes exactly 1000 characters', () => {
      const validData = {
        userNotes: 'a'.repeat(1000),
      };

      const result = updateAlbumSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
