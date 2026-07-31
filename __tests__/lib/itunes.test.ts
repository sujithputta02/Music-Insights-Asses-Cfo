import { searchAlbums, type iTunesSearchResult } from '@/lib/itunes';

// Mock fetch for testing
global.fetch = jest.fn();

describe('iTunes API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear module cache to reset the in-memory cache
    jest.resetModules();
  });

  describe('searchAlbums', () => {
    it('should search albums successfully', async () => {
      const mockResponse: iTunesSearchResult = {
        resultCount: 2,
        results: [
          {
            collectionId: 1234567890,
            artistName: 'Test Artist',
            collectionName: 'Test Album',
            collectionPrice: 9.99,
            releaseDate: '2024-01-01T00:00:00Z',
            trackCount: 12,
            primaryGenreName: 'Rock',
            artworkUrl100: 'https://example.com/artwork.jpg',
          },
          {
            collectionId: 1234567891,
            artistName: 'Another Artist',
            collectionName: 'Another Album',
            collectionPrice: 12.99,
            releaseDate: '2023-06-15T00:00:00Z',
            trackCount: 10,
            primaryGenreName: 'Pop',
            artworkUrl100: 'https://example.com/artwork2.jpg',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchAlbums('test query');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://itunes.apple.com/search'),
        expect.any(Object)
      );
    });

    it('should default to limit 20', async () => {
      const mockResponse: iTunesSearchResult = {
        resultCount: 0,
        results: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await searchAlbums('test default limit');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20'),
        expect.any(Object)
      );
    });

    it('should encode search query', async () => {
      const mockResponse: iTunesSearchResult = {
        resultCount: 0,
        results: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await searchAlbums('test query with spaces');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('term=test%20query%20with%20spaces'),
        expect.any(Object)
      );
    });
  });
});
