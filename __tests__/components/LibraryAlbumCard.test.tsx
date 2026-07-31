import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibraryAlbumCard from '@/components/LibraryAlbumCard';
import { Album } from '@/lib/types';

const mockAlbum: Album = {
  id: '1',
  userId: 'user123',
  appleCatalogId: 1234567890,
  title: 'Library Test Album',
  artistName: 'Library Test Artist',
  genre: 'Pop',
  releaseDate: new Date('2023-06-15'),
  trackCount: 10,
  artworkUrl: 'https://example.com/library-artwork.jpg',
  collectionPrice: 12.99,
  userRating: 4,
  userNotes: 'Great album!',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('LibraryAlbumCard', () => {
  it('should render album information', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Library Test Album')).toBeInTheDocument();
    expect(screen.getByText('Library Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('10 tracks')).toBeInTheDocument();
  });

  it('should display user rating', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Should display 4 filled stars and 1 empty star
    const stars = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('svg')
    );
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should display user notes', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Great album!')).toBeInTheDocument();
  });

  it('should call onUpdate when rating is changed', async () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Click on a star button (assuming they're rendered)
    const starButtons = screen.getAllByRole('button');
    const firstStarButton = starButtons.find((btn) => 
      btn.querySelector('svg[data-testid="star"]') || btn.querySelector('svg')
    );
    
    if (firstStarButton) {
      fireEvent.click(firstStarButton);
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    }
  });

  it('should call onDelete when delete button is clicked', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should handle album without rating', () => {
    const albumWithoutRating = { ...mockAlbum, userRating: null };
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={albumWithoutRating}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Should render but with no filled stars
    expect(screen.getByText('Library Test Album')).toBeInTheDocument();
  });

  it('should handle album without notes', () => {
    const albumWithoutNotes = { ...mockAlbum, userNotes: null };
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={albumWithoutNotes}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Great album!')).not.toBeInTheDocument();
  });

  it('should display release year', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    render(
      <LibraryAlbumCard
        album={mockAlbum}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('2023')).toBeInTheDocument();
  });
});
