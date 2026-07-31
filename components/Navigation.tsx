'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Button from './ui/Button';
import { House, MagnifyingGlass, Disc, ChartBar, SignOut, Sparkle } from '@phosphor-icons/react';
import clsx from 'clsx';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/search', label: 'Search', icon: MagnifyingGlass },
    { href: '/library', label: 'Library', icon: Disc },
    { href: '/analytics', label: 'Analytics', icon: ChartBar },
    { href: '/recommendations', label: 'AI Insights', icon: Sparkle },
  ];

  return (
    <nav className="border-b border-border bg-canvas/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Disc size={32} weight="duotone" className="text-text-primary" />
            <span className="text-xl font-serif text-text-primary">
              Music Insights
            </span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
                      {
                        'bg-surface text-text-primary': isActive,
                        'text-text-muted hover:text-text-primary hover:bg-canvas-warm': !isActive,
                      }
                    )}
                  >
                    <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-text-muted">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <SignOut size={18} />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
