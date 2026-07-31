import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState Component', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No Results"
        description="Try a different search term"
      />
    );

    expect(screen.getByText('No Results')).toBeInTheDocument();
    expect(screen.getByText('Try a different search term')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const TestIcon = <div data-testid="test-icon">📦</div>;
    render(
      <EmptyState
        icon={TestIcon}
        title="Empty"
        description="Nothing here"
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const action = <button>Take Action</button>;
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        action={action}
      />
    );

    expect(screen.getByText('Take Action')).toBeInTheDocument();
  });

  it('should render without icon', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
      />
    );

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('should render without action', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        description="Nothing here"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center');
  });
});
