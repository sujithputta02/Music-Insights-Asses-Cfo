import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Album schemas
export const addAlbumSchema = z.object({
  appleCatalogId: z.string().min(1, 'Apple Catalog ID is required'),
  title: z.string().min(1, 'Title is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  genre: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable(),
  trackCount: z.number().int().positive().optional().nullable(),
  artworkUrl: z.string().url().optional().nullable().or(z.literal('')),
  collectionPrice: z.number().positive().optional().nullable(),
});

export const updateAlbumSchema = z.object({
  userRating: z.number().int().min(0).max(5).optional(),
  userNotes: z.string().max(1000, 'Notes too long (max 1000 characters)').optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().int().positive().max(50).optional().default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddAlbumInput = z.infer<typeof addAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
