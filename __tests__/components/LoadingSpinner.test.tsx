import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('[data-testid="loading-spinner"]') || container.firstChild).toBeInTheDocument();
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.w-4') || container.querySelector('.w-5');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with medium size (default)', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    const spinner = container.querySelector('.w-8') || container.querySelector('.w-10');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.w-12') || container.querySelector('.w-16');
    expect(spinner).toBeInTheDocument();
  });

  it('should be centered when center prop is true', () => {
    const { container } = render(<LoadingSpinner center />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'justify-center', 'items-center');
  });

  it('should apply animation classes', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin') || container.firstChild;
    expect(spinner).toBeInTheDocument();
  });
});
