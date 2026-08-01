'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Sparkle, Lightbulb, ArrowClockwise } from '@phosphor-icons/react';
import Link from 'next/link';

interface AIRecommendation {
  album: any; // iTunes album data
  reason: string;
  confidence: number;
}

interface AIInsights {
  summary?: string;
  dominantGenres?: string[];
  listeningPersonality?: string;
  recommendations: AIRecommendation[];
  trends?: string[];
  generatedAt?: string;
  hasCachedRecommendations?: boolean;
  message?: string;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      loadRecommendations();
    }
  }, [mounted, isAuthenticated, router]);

  // Load cached recommendations (doesn't count against rate limit)
  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AIInsights>('/api/recommendations');
      if (response.success && response.data) {
        setInsights(response.data);
      } else {
        setError(response.error || 'Failed to load recommendations');
      }
    } catch (err) {
      setError('An error occurred while loading recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Generate new recommendations (counts against rate limit)
  const generateNewRecommendations = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await apiClient.post<AIInsights>('/api/recommendations', {});
      if (response.success && response.data) {
        setInsights(response.data);
      } else {
        setError(response.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError('An error occurred while generating recommendations');
    } finally {
      setGenerating(false);
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
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
        <p className="text-text-muted">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<Sparkle size={64} weight="light" />}
          title="Unable to Load Recommendations"
          description={error}
          action={
            error.includes('No albums') ? (
              <Link href="/search">
                <Button variant="primary">Add Albums to Library</Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={loadRecommendations}>
                Try Again
              </Button>
            )
          }
        />
      </div>
    );
  }

  // No recommendations yet
  if (!insights || insights.recommendations.length === 0) {
    const message = insights?.message || "Add albums to your library to get AI-powered recommendations.";
    const hasNoAlbums = message.includes('No albums in library');
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<Sparkle size={64} weight="light" />}
          title={hasNoAlbums ? "Build Your Library First" : "No Recommendations Yet"}
          description={message}
          action={
            hasNoAlbums ? (
              <Link href="/search">
                <Button variant="primary">
                  Search Albums
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                onClick={generateNewRecommendations}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle size={18} weight="bold" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 animate-slide-up flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-serif text-text-primary mb-4">
            AI Recommendations
          </h1>
          <p className="text-text-muted text-lg">
            Personalized insights powered by artificial intelligence
          </p>
          {insights.generatedAt && (
            <p className="text-sm text-text-muted mt-2">
              Generated {formatTimeAgo(insights.generatedAt)}
            </p>
          )}
        </div>
        <Button 
          variant="secondary" 
          onClick={generateNewRecommendations}
          disabled={generating}
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating...
            </>
          ) : (
            <>
              <ArrowClockwise size={18} weight="bold" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Personality Card (only if available from full insights) */}
      {insights.listeningPersonality && (
        <Card className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-yellow-bg rounded-lg">
                <Sparkle size={32} weight="duotone" className="text-accent-yellow-text" />
              </div>
              <div>
                <CardTitle>Your Music Personality</CardTitle>
                <Badge variant="yellow" className="mt-2">
                  {insights.listeningPersonality}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Trends (only if available from full insights) */}
      {insights.trends && insights.trends.length > 0 && (
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
      )}

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
          const album = rec.album;
          
          return (
            <Card
              key={index}
              className="animate-slide-up"
              style={{ animationDelay: `${250 + index * 50}ms` }}
            >
              <div className="flex gap-4">
                {/* Album artwork */}
                <div className="w-24 h-24 flex-shrink-0 bg-canvas-warm rounded-md overflow-hidden">
                  {album.artworkUrl100 && (
                    <img
                      src={album.artworkUrl100}
                      alt={album.collectionName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary mb-1 line-clamp-2">
                    {album.collectionName}
                  </h3>
                  <p className="text-sm text-text-muted mb-2">{album.artistName}</p>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddToLibrary(album)}
                    >
                      Add to Library
                    </Button>
                    <Badge variant="blue" className="text-xs">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
