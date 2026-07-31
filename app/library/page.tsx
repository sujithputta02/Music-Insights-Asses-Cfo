'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { Album } from '@/lib/types';
import LibraryAlbumCard from '@/components/LibraryAlbumCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { Disc, SortAscending, CaretLeft, CaretRight } from '@phosphor-icons/react';
import Link from 'next/link';

type SortOption = 'recent' | 'title' | 'artist' | 'rating' | 'year';

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 12;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    if (mounted && isAuthenticated()) {
      fetchLibrary();
    }
  }, [mounted, isAuthenticated, router, currentPage]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{
        data: Album[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasMore: boolean;
        };
      }>(`/api/library?page=${currentPage}&limit=${itemsPerPage}`);
      
      if (response.success && response.data) {
        setAlbums(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        
        // Extract unique genres
        const uniqueGenres = Array.from(
          new Set(response.data.data.map((a) => a.genre).filter(Boolean))
        ).sort() as string[];
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter albums
  useEffect(() => {
    let result = [...albums];

    // Filter by genre
    if (filterGenre !== 'all') {
      result = result.filter((album) => album.genre === filterGenre);
    }

    // Sort
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'artist':
        result.sort((a, b) => a.artistName.localeCompare(b.artistName));
        break;
      case 'rating':
        result.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
        break;
      case 'year':
        result.sort((a, b) => {
          const yearA = a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0;
          const yearB = b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0;
          return yearB - yearA;
        });
        break;
      case 'recent':
      default:
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    setFilteredAlbums(result);
  }, [albums, sortBy, filterGenre]);

  const handleUpdate = async (id: string, data: { userRating?: number; userNotes?: string }) => {
    const response = await apiClient.put(`/api/library/${id}`, data);
    if (response.success) {
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === id ? { ...album, ...data } : album
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this album from your library?')) return;
    
    const response = await apiClient.delete(`/api/library/${id}`);
    if (response.success) {
      setAlbums((prev) => prev.filter((album) => album.id !== id));
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-5xl font-serif text-text-primary mb-4">
          Your Library
        </h1>
        <p className="text-text-muted text-lg">
          {total} {total === 1 ? 'album' : 'albums'} in your collection
        </p>
      </div>

      {loading ? (
        <div className="py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : albums.length === 0 ? (
        <EmptyState
          icon={<Disc size={64} weight="light" />}
          title="Your library is empty"
          description="Start building your collection by searching for albums and adding them to your library."
          action={
            <Link href="/search">
              <Button variant="primary">Browse Albums</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Filters & Sort */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-slide-up" style={{ animationDelay: '100ms' }}>
            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-primary">Genre:</label>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="input py-1.5 px-3 text-sm"
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAscending size={20} className="text-text-muted" />
              <label className="text-sm font-medium text-text-primary">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input py-1.5 px-3 text-sm"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
                <option value="rating">Rating</option>
                <option value="year">Release Year</option>
              </select>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map((album, index) => (
              <div
                key={album.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <LibraryAlbumCard
                  album={album}
                  onUpdate={(data) => handleUpdate(album.id, data)}
                  onDelete={() => handleDelete(album.id)}
                />
              </div>
            ))}
          </div>

          {filteredAlbums.length === 0 && filterGenre !== 'all' && (
            <EmptyState
              icon={<Disc size={64} weight="light" />}
              title="No albums in this genre"
              description={`No albums found in ${filterGenre}. Try a different genre filter.`}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 animate-slide-up">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                <CaretLeft size={20} />
                Previous
              </Button>
              
              <div className="flex items-center gap-2 px-4">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          pageNum === currentPage
                            ? 'bg-accent-primary text-white'
                            : 'bg-background-secondary text-text-muted hover:bg-background-tertiary hover:text-text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="text-text-muted px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <CaretRight size={20} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
