import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AlbumCard from '@/components/AlbumCard';
import { Album } from '@/lib/types';

const mockAlbum: Album = {
  id: '1',
  userId: 'user123',
  appleCatalogId: 1234567890,
  title: 'Test Album',
  artistName: 'Test Artist',
  genre: 'Rock',
  releaseDate: new Date('2024-01-01'),
  trackCount: 12,
  artworkUrl: 'https://example.com/artwork.jpg',
  collectionPrice: 9.99,
  userRating: null,
  userNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AlbumCard', () => {
  it('should render album information', () => {
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={mockAlbum} onAdd={mockOnAdd} />);

    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('12 tracks')).toBeInTheDocument();
  });

  it('should display album artwork', () => {
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={mockAlbum} onAdd={mockOnAdd} />);

    const image = screen.getByAltText('Test Album');
    expect(image).toBeInTheDocument();
  });

  it('should call onAdd when add button is clicked', () => {
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={mockAlbum} onAdd={mockOnAdd} />);

    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('should handle album without genre', () => {
    const albumWithoutGenre = { ...mockAlbum, genre: null };
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={albumWithoutGenre} onAdd={mockOnAdd} />);

    expect(screen.queryByText('Rock')).not.toBeInTheDocument();
  });

  it('should handle album without trackCount', () => {
    const albumWithoutTracks = { ...mockAlbum, trackCount: null };
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={albumWithoutTracks} onAdd={mockOnAdd} />);

    expect(screen.queryByText(/tracks/)).not.toBeInTheDocument();
  });

  it('should display single track correctly', () => {
    const singleTrackAlbum = { ...mockAlbum, trackCount: 1 };
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={singleTrackAlbum} onAdd={mockOnAdd} />);

    expect(screen.getByText('1 track')).toBeInTheDocument();
  });

  it('should display price when available', () => {
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={mockAlbum} onAdd={mockOnAdd} />);

    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('should handle album without price', () => {
    const albumWithoutPrice = { ...mockAlbum, collectionPrice: null };
    const mockOnAdd = jest.fn();
    render(<AlbumCard album={albumWithoutPrice} onAdd={mockOnAdd} />);

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
