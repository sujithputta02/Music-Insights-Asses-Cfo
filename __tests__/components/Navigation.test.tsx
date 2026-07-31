import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '@/components/Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock zustand store
jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({
    isAuthenticated: jest.fn(() => true),
    logout: jest.fn(),
  }),
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should render navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText('Music Insights')).toBeInTheDocument();
  });

  it('should render all navigation items for authenticated user', () => {
    render(<Navigation />);

    expect(screen.getByText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/library/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(<Navigation />);

    // Home should be active by default
    const homeLink = screen.getByText('Music Insights').closest('a');
    expect(homeLink).toHaveClass('text-accent-primary');
  });

  it('should render logout button for authenticated user', () => {
    render(<Navigation />);

    const logoutButton = screen.getByText(/logout/i);
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    const mockLogout = jest.fn();
    jest.spyOn(require('@/lib/store'), 'useAuthStore').mockReturnValue({
      isAuthenticated: jest.fn(() => true),
      logout: mockLogout,
    });

    render(<Navigation />);

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should render mobile menu toggle', () => {
    render(<Navigation />);

    // Mobile menu button should be present
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});
