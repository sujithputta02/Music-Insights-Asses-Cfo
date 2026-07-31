import { ITunesSearchResponse, SearchParams } from './types';

const ITUNES_API_BASE = 'https://itunes.apple.com';

// In-memory cache for search results (valid for 5 minutes)
const searchCache = new Map<string, { data: ITunesSearchResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchAlbums(params: SearchParams): Promise<ITunesSearchResponse> {
  const { query, limit = 20 } = params;
  const cacheKey = `${query}-${limit}`;

  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const url = new URL(`${ITUNES_API_BASE}/search`);
  url.searchParams.set('term', query);
  url.searchParams.set('entity', 'album');
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('media', 'music');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MusicInsightsApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.statusText}`);
    }

    const data: ITunesSearchResponse = await response.json();

    // Cache the result
    searchCache.set(cacheKey, { data, timestamp: Date.now() });

    // Clean up old cache entries
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) {
        searchCache.delete(oldestKey);
      }
    }

    return data;
  } catch (error) {
    console.error('iTunes API search error:', error);
    throw new Error('Failed to search albums from iTunes API');
  }
}

export async function lookupAlbum(collectionId: number): Promise<ITunesSearchResponse> {
  const url = new URL(`${ITUNES_API_BASE}/lookup`);
  url.searchParams.set('id', collectionId.toString());
  url.searchParams.set('entity', 'album');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('iTunes API lookup error:', error);
    throw new Error('Failed to lookup album from iTunes API');
  }
}

// Clear cache periodically
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of searchCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        searchCache.delete(key);
      }
    }
  }, 10 * 60 * 1000); // Clean every 10 minutes
}
