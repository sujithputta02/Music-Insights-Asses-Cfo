'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { searchAlbums } from '@/lib/itunes';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import AlbumCard from '@/components/AlbumCard';
import { Sparkle, Disc, Lightbulb } from '@phosphor-icons/react';
import Link from 'next/link';

interface Recommendation {
  artist: string;
  album: string;
  reason: string;
  searchTerm: string;
}

interface AIInsights {
  summary: string;
  personality: string;
  recommendations: Recommendation[];
  trends: string[];
}

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchingAlbum, setSearchingAlbum] = useState<string | null>(null);
  const [foundAlbums, setFoundAlbums] = useState<Map<string, any>>(new Map());

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
      fetchRecommendations();
    }
  }, [mounted, isAuthenticated, router]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AIInsights>('/api/recommendations');
      if (response.success && response.data) {
        setInsights(response.data);
        // Automatically search for recommended albums
        searchForRecommendedAlbums(response.data.recommendations);
      } else {
        setError(response.error || 'Failed to get recommendations');
      }
    } catch (err) {
      setError('An error occurred while generating recommendations');
    } finally {
      setLoading(false);
    }
  };

  const searchForRecommendedAlbums = async (recommendations: Recommendation[]) => {
    const results = new Map();
    
    for (const rec of recommendations) {
      try {
        const searchResult = await searchAlbums({ query: rec.searchTerm, limit: 1 });
        if (searchResult.results.length > 0) {
          results.set(rec.searchTerm, searchResult.results[0]);
        }
      } catch (error) {
        console.error(`Failed to search for ${rec.searchTerm}:`, error);
      }
    }
    
    setFoundAlbums(results);
  };

  const handleAddToLibrary = async (album: any) => {
    try {
      await apiClient.post('/api/library', {
        appleCatalogId: album.collectionId.toString(),
        title: album.collectionName,
        artistName: album.artistName,
        genre: album.primaryGenreName,
        releaseDate: album.releaseDate,
        trackCount: album.trackCount,
        artworkUrl: album.artworkUrl100,
        collectionPrice: album.collectionPrice,
      });
    } catch (error) {
      console.error('Failed to add album:', error);
    }
  };

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Sparkle size={48} weight="duotone" className="text-text-primary mb-4 animate-pulse" />
        <p className="text-text-muted">Analyzing your music taste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<Sparkle size={64} weight="light" />}
          title="Unable to Generate Recommendations"
          description={error}
          action={
            error.includes('No albums') ? (
              <Link href="/search">
                <Button variant="primary">Add Albums to Library</Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={fetchRecommendations}>
                Try Again
              </Button>
            )
          }
        />
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 animate-slide-up">
        <h1 className="text-5xl font-serif text-text-primary mb-4">
          AI Recommendations
        </h1>
        <p className="text-text-muted text-lg">
          Personalized insights powered by artificial intelligence
        </p>
      </div>

      {/* Personality Card */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-yellow-bg rounded-lg">
              <Sparkle size={32} weight="duotone" className="text-accent-yellow-text" />
            </div>
            <div>
              <CardTitle>Your Music Personality</CardTitle>
              <Badge variant="yellow" className="mt-2">
                {insights.personality}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary leading-relaxed">{insights.summary}</p>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb size={24} weight="duotone" className="text-text-primary" />
            <CardTitle>Insights About Your Collection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.trends.map((trend, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-accent-blue-text font-mono text-sm mt-1">•</span>
                <span className="text-text-secondary leading-relaxed">{trend}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-3xl font-serif text-text-primary mb-2">
          Recommended for You
        </h2>
        <p className="text-text-muted">
          Albums we think you'll love based on your collection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.recommendations.map((rec, index) => {
          const album = foundAlbums.get(rec.searchTerm);
          
          return (
            <Card
              key={index}
              className="animate-slide-up"
              style={{ animationDelay: `${250 + index * 50}ms` }}
            >
              <div className="flex gap-4">
                {/* Album artwork if found */}
                {album && (
                  <div className="w-24 h-24 flex-shrink-0 bg-canvas-warm rounded-md overflow-hidden">
                    {album.artworkUrl100 && (
                      <img
                        src={album.artworkUrl100}
                        alt={rec.album}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary mb-1 line-clamp-2">
                    {rec.album}
                  </h3>
                  <p className="text-sm text-text-muted mb-2">{rec.artist}</p>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {rec.reason}
                  </p>
                  
                  {album && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddToLibrary(album)}
                    >
                      Add to Library
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="mt-12 text-center">
        <Button variant="secondary" onClick={fetchRecommendations}>
          <Sparkle size={18} weight="bold" />
          Generate New Recommendations
        </Button>
      </div>
    </div>
  );
}
