'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { AnalyticsData } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import GenreDistributionChart from '@/components/charts/GenreDistributionChart';
import TopArtistsChart from '@/components/charts/TopArtistsChart';
import ReleasesByYearChart from '@/components/charts/ReleasesByYearChart';
import TrackCountChart from '@/components/charts/TrackCountChart';
import { ChartBar, Disc, Star, MusicNotes } from '@phosphor-icons/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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
      fetchAnalytics();
    }
  }, [mounted, isAuthenticated, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AnalyticsData>('/api/analytics');
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics || analytics.totalAlbums === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<ChartBar size={64} weight="light" />}
          title="No Analytics Yet"
          description="Add albums to your library to see insights about your music taste."
          action={
            <Link href="/search">
              <Button variant="primary">Start Adding Albums</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 animate-slide-up">
        <h1 className="text-5xl font-serif text-text-primary mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-text-muted text-lg">
          Explore insights about your music collection
        </p>
      </div>

      {/* Stats Overview - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Albums */}
        <Card hover={false} className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider mb-1">
                Total Albums
              </p>
              <p className="text-4xl font-serif text-text-primary">
                {analytics.totalAlbums}
              </p>
            </div>
            <div className="p-3 bg-accent-blue-bg rounded-lg">
              <Disc size={32} weight="duotone" className="text-accent-blue-text" />
            </div>
          </div>
        </Card>

        {/* Unique Artists */}
        <Card hover={false} className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider mb-1">
                Artists
              </p>
              <p className="text-4xl font-serif text-text-primary">
                {analytics.totalArtists}
              </p>
            </div>
            <div className="p-3 bg-accent-green-bg rounded-lg">
              <MusicNotes size={32} weight="duotone" className="text-accent-green-text" />
            </div>
          </div>
        </Card>

        {/* Average Rating */}
        <Card hover={false} className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider mb-1">
                Avg Rating
              </p>
              <p className="text-4xl font-serif text-text-primary">
                {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-accent-yellow-bg rounded-lg">
              <Star size={32} weight="duotone" className="text-accent-yellow-text" />
            </div>
          </div>
        </Card>

        {/* Top Genre */}
        <Card hover={false} className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider mb-1">
                Top Genre
              </p>
              <p className="text-2xl font-serif text-text-primary line-clamp-2">
                {analytics.genreDistribution[0]?.genre || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-accent-red-bg rounded-lg">
              <ChartBar size={32} weight="duotone" className="text-accent-red-text" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution - Pie Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Breakdown of albums by genre
            </p>
          </CardHeader>
          <CardContent>
            <GenreDistributionChart data={analytics.genreDistribution.slice(0, 8)} />
          </CardContent>
        </Card>

        {/* Top Artists - Horizontal Bar Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle>Top Artists</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Most collected artists in your library
            </p>
          </CardHeader>
          <CardContent>
            <TopArtistsChart data={analytics.topArtists.slice(0, 8)} />
          </CardContent>
        </Card>

        {/* Releases by Year - Line Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Releases Over Time</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Albums by release year
            </p>
          </CardHeader>
          <CardContent>
            <ReleasesByYearChart data={analytics.releasesByYear} />
          </CardContent>
        </Card>

        {/* Track Count Distribution - Histogram */}
        <Card className="animate-slide-up" style={{ animationDelay: '350ms' }}>
          <CardHeader>
            <CardTitle>Album Length Distribution</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Albums grouped by track count
            </p>
          </CardHeader>
          <CardContent>
            <TrackCountChart data={analytics.trackCountDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
