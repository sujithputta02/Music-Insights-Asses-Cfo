'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Disc, MagnifyingGlass, ChartBar, Sparkle, Star, Lightning, Users } from '@phosphor-icons/react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Bento Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-yellow-bg rounded-full mb-6">
            <Lightning size={16} weight="fill" className="text-accent-yellow-text" />
            <span className="text-sm font-medium text-accent-yellow-text">
              Powered by Groq AI • 10x Faster
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-text-primary mb-6 leading-tight">
            Your Music Library,
            <br />
            <span className="text-text-secondary">Beautifully Analyzed</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover, curate, and explore your personal album collection with AI-powered insights
            and stunning visual analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {authenticated ? (
              <>
                <Link href="/search">
                  <Button variant="primary" size="lg" className="min-w-[180px]">
                    <MagnifyingGlass size={20} weight="bold" />
                    Search Albums
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="secondary" size="lg" className="min-w-[180px]">
                    <Disc size={20} weight="bold" />
                    My Library
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button variant="primary" size="lg" className="min-w-[180px]">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="secondary" size="lg" className="min-w-[180px]">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bento Grid - Features */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          {/* Large Feature - Search & Discover */}
          <div 
            className="md:col-span-4 md:row-span-2 bg-surface border border-border rounded-2xl p-8 md:p-12 hover:shadow-hover transition-all duration-300 animate-slide-up relative overflow-hidden group"
            style={{ animationDelay: '100ms' }}
          >
            {/* Ambient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue-bg/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex p-4 bg-accent-blue-bg rounded-xl mb-6">
                <MagnifyingGlass size={40} weight="duotone" className="text-accent-blue-text" />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">
                Search & Discover
              </h3>
              <p className="text-lg text-text-muted leading-relaxed mb-6 max-w-2xl">
                Explore millions of albums from the iTunes catalog. Search by title, artist, or genre.
                Find your favorites and add them to your personal library with a single click.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-canvas-warm rounded-full text-sm text-text-secondary">
                  Instant Search
                </span>
                <span className="px-3 py-1 bg-canvas-warm rounded-full text-sm text-text-secondary">
                  300ms Debounce
                </span>
                <span className="px-3 py-1 bg-canvas-warm rounded-full text-sm text-text-secondary">
                  Real-time Results
                </span>
              </div>
            </div>
          </div>

          {/* Medium Feature - Analytics */}
          <div 
            className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up group"
            style={{ animationDelay: '150ms' }}
          >
            <div className="inline-flex p-3 bg-accent-green-bg rounded-xl mb-4">
              <ChartBar size={32} weight="duotone" className="text-accent-green-text" />
            </div>
            <h3 className="text-2xl font-serif text-text-primary mb-3">
              Visual Analytics
            </h3>
            <p className="text-text-muted leading-relaxed mb-4">
              4+ chart types reveal your music taste patterns
            </p>
            <div className="flex items-center gap-2 text-accent-green-text text-sm font-medium">
              <ChartBar size={16} weight="bold" />
              <span>Pie • Bar • Area • Histogram</span>
            </div>
          </div>

          {/* Medium Feature - Collection Stats */}
          <div 
            className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up group"
            style={{ animationDelay: '200ms' }}
          >
            <div className="inline-flex p-3 bg-accent-red-bg rounded-xl mb-4">
              <Disc size={32} weight="duotone" className="text-accent-red-text" />
            </div>
            <h3 className="text-2xl font-serif text-text-primary mb-3">
              Smart Library
            </h3>
            <p className="text-text-muted leading-relaxed mb-4">
              Rate, annotate, and organize your albums
            </p>
            <div className="flex items-center gap-2 text-accent-red-text text-sm font-medium">
              <Star size={16} weight="fill" />
              <span>5-star ratings • Personal notes</span>
            </div>
          </div>
        </div>

        {/* Bento Grid - AI & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* AI Feature - Large */}
          <div 
            className="md:col-span-4 bg-gradient-to-br from-accent-yellow-bg to-accent-yellow-bg/50 border border-accent-yellow-text/20 rounded-2xl p-8 md:p-10 hover:shadow-hover transition-all duration-300 animate-slide-up relative overflow-hidden group"
            style={{ animationDelay: '250ms' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow-text/10 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex p-3 bg-white/80 backdrop-blur-sm rounded-xl mb-4">
                    <Sparkle size={32} weight="duotone" className="text-accent-yellow-text" />
                  </div>
                  <h3 className="text-3xl font-serif text-text-primary mb-3">
                    AI-Powered Insights
                  </h3>
                  <p className="text-text-secondary leading-relaxed max-w-xl">
                    Get personalized album recommendations powered by Groq's lightning-fast Llama 3.3 70B.
                    Discover your music personality and receive intelligent suggestions in under 2 seconds.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-serif text-accent-yellow-text mb-1">10x</div>
                  <div className="text-sm text-text-muted">Faster than OpenAI</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-serif text-accent-yellow-text mb-1">75%</div>
                  <div className="text-sm text-text-muted">Token savings</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-serif text-accent-yellow-text mb-1">$0</div>
                  <div className="text-sm text-text-muted">Cost (free tier)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div className="md:col-span-2 grid grid-cols-1 gap-4">
            {/* Stat 1 */}
            <div 
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center justify-between mb-3">
                <Users size={24} weight="duotone" className="text-accent-blue-text" />
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Catalog
                </span>
              </div>
              <div className="text-3xl font-serif text-text-primary mb-1">Millions</div>
              <div className="text-sm text-text-muted">Albums to discover</div>
            </div>

            {/* Stat 2 */}
            <div 
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: '350ms' }}
            >
              <div className="flex items-center justify-between mb-3">
                <Lightning size={24} weight="fill" className="text-accent-yellow-text" />
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Performance
                </span>
              </div>
              <div className="text-3xl font-serif text-text-primary mb-1">&lt;2s</div>
              <div className="text-sm text-text-muted">AI response time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Breakdown */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-text-primary mb-4">
            Everything you need to understand
            <br className="hidden md:block" />
            your music taste
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            A complete platform for music enthusiasts who want to go beyond just listening
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Detail 1 */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up">
            <div className="w-12 h-12 bg-accent-blue-bg rounded-xl flex items-center justify-center mb-4">
              <MagnifyingGlass size={24} weight="bold" className="text-accent-blue-text" />
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">
              Powerful Search
            </h3>
            <ul className="space-y-2 text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent-blue-text mt-1">•</span>
                <span>Real-time iTunes API integration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-blue-text mt-1">•</span>
                <span>300ms debounced search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-blue-text mt-1">•</span>
                <span>5-minute intelligent caching</span>
              </li>
            </ul>
          </div>

          {/* Feature Detail 2 */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="w-12 h-12 bg-accent-green-bg rounded-xl flex items-center justify-center mb-4">
              <ChartBar size={24} weight="bold" className="text-accent-green-text" />
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">
              Rich Analytics
            </h3>
            <ul className="space-y-2 text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent-green-text mt-1">•</span>
                <span>Genre distribution pie chart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green-text mt-1">•</span>
                <span>Top artists horizontal bar chart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green-text mt-1">•</span>
                <span>Releases over time area chart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green-text mt-1">•</span>
                <span>Track count histogram</span>
              </li>
            </ul>
          </div>

          {/* Feature Detail 3 */}
          <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 bg-accent-yellow-bg rounded-xl flex items-center justify-center mb-4">
              <Sparkle size={24} weight="bold" className="text-accent-yellow-text" />
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">
              AI Recommendations
            </h3>
            <ul className="space-y-2 text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent-yellow-text mt-1">•</span>
                <span>Music personality analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-yellow-text mt-1">•</span>
                <span>5 personalized suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-yellow-text mt-1">•</span>
                <span>Collection trend detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-yellow-text mt-1">•</span>
                <span>Auto iTunes search integration</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!authenticated && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="bg-gradient-to-br from-accent-blue-bg to-accent-yellow-bg/30 border border-border rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">
              Ready to explore your music taste?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Join music enthusiasts who are discovering insights about their collection.
              Start building your library today — completely free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="min-w-[200px]">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Footer */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-text-muted font-mono mb-4 uppercase tracking-wider">
            Built With Modern Technology
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-text-muted">
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">Next.js 16</span>
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">Groq AI (Llama 3.3 70B)</span>
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">PostgreSQL</span>
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">Prisma ORM</span>
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">Recharts</span>
            <span className="px-4 py-2 bg-surface border border-border rounded-lg">iTunes API</span>
          </div>
        </div>
      </section>
    </div>
  );
}
