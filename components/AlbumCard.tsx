'use client';

import Image from 'next/image';
import { ITunesAlbum } from '@/lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { Plus, Star } from '@phosphor-icons/react';

interface AlbumCardProps {
  album: ITunesAlbum;
  onAdd?: () => void;
  adding?: boolean;
  inLibrary?: boolean;
}

export default function AlbumCard({ album, onAdd, adding, inLibrary }: AlbumCardProps) {
  return (
    <div className="card group animate-slide-up">
      {/* Album Artwork */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-canvas-warm">
        {album.artworkUrl100 ? (
          <Image
            src={album.artworkUrl100.replace('100x100', '300x300')}
            alt={album.collectionName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Star size={48} weight="light" />
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-text-primary line-clamp-2 leading-tight">
          {album.collectionName}
        </h3>
        <p className="text-sm text-text-muted">{album.artistName}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {album.primaryGenreName && (
            <Badge variant="default">{album.primaryGenreName}</Badge>
          )}
          {album.trackCount && (
            <span className="text-xs text-text-muted font-mono">
              {album.trackCount} tracks
            </span>
          )}
        </div>

        {album.releaseDate && (
          <p className="text-xs text-text-muted font-mono">
            {new Date(album.releaseDate).getFullYear()}
          </p>
        )}

        {onAdd && !inLibrary && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAdd}
            loading={adding}
            disabled={adding}
            className="w-full mt-4"
          >
            <Plus size={16} weight="bold" />
            Add to Library
          </Button>
        )}

        {inLibrary && (
          <div className="flex items-center gap-1 text-accent-green-text text-sm font-medium mt-4">
            <Star size={16} weight="fill" />
            In Library
          </div>
        )}
      </div>
    </div>
  );
}
