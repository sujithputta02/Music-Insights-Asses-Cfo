'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { ITunesAlbum } from '@/lib/types';
import Input from '@/components/ui/Input';
import AlbumCard from '@/components/AlbumCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { MagnifyingGlass } from '@phosphor-icons/react';

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<ITunesAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Fetch user's library to know which albums are already added
  useEffect(() => {
    const fetchLibrary = async () => {
      const response = await apiClient.get<any[]>('/api/library');
      if (response.success && response.data) {
        const ids = new Set(response.data.map((album) => album.appleCatalogId));
        setLibraryIds(ids);
      }
    };
    fetchLibrary();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAlbums([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get<{ resultCount: number; results: ITunesAlbum[] }>(
        `/api/search?query=${encodeURIComponent(searchQuery)}&limit=20`
      );

      if (response.success && response.data) {
        setAlbums(response.data.results);
      } else {
        setAlbums([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleAddToLibrary = async (album: ITunesAlbum) => {
    setAddingId(album.collectionId);
    try {
      const response = await apiClient.post('/api/library', {
        appleCatalogId: album.collectionId.toString(),
        title: album.collectionName,
        artistName: album.artistName,
        genre: album.primaryGenreName,
        releaseDate: album.releaseDate,
        trackCount: album.trackCount,
        artworkUrl: album.artworkUrl100,
        collectionPrice: album.collectionPrice,
      });

      if (response.success) {
        setLibraryIds((prev) => new Set(prev).add(album.collectionId.toString()));
      }
    } catch (error) {
      console.error('Add to library error:', error);
    } finally {
      setAddingId(null);
    }
  };

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="py-24">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 animate-slide-up">
        <h1 className="text-5xl font-serif text-text-primary mb-4">
          Search Albums
        </h1>
        <p className="text-text-muted text-lg">
          Explore millions of albums from the iTunes catalog
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="relative max-w-2xl">
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            type="text"
            placeholder="Search by album, artist, or genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg"
          />
        </div>
        {query && (
          <p className="mt-2 text-sm text-text-muted font-mono">
            {loading ? 'Searching...' : `${albums.length} results`}
          </p>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <div
              key={album.collectionId}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AlbumCard
                album={album}
                onAdd={() => handleAddToLibrary(album)}
                adding={addingId === album.collectionId}
                inLibrary={libraryIds.has(album.collectionId.toString())}
              />
            </div>
          ))}
        </div>
      ) : query ? (
        <EmptyState
          icon={<MagnifyingGlass size={64} weight="light" />}
          title="No albums found"
          description={`No results for "${query}". Try a different search term.`}
        />
      ) : (
        <EmptyState
          icon={<MagnifyingGlass size={64} weight="light" />}
          title="Start Searching"
          description="Enter an album name, artist, or genre to discover music from the iTunes catalog."
        />
      )}
    </div>
  );
}
