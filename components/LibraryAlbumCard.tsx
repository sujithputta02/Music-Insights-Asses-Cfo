'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Album } from '@/lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { Star, Trash, NotePencil, X, Check } from '@phosphor-icons/react';

interface LibraryAlbumCardProps {
  album: Album;
  onUpdate: (data: { userRating?: number; userNotes?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function LibraryAlbumCard({ album, onUpdate, onDelete }: LibraryAlbumCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(album.userRating || 0);
  const [notes, setNotes] = useState(album.userNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ userRating: rating, userNotes: notes });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRating(album.userRating || 0);
    setNotes(album.userNotes || '');
    setIsEditing(false);
  };

  return (
    <div className="card group animate-slide-up">
      {/* Album Artwork */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-canvas-warm">
        {album.artworkUrl ? (
          <Image
            src={album.artworkUrl.replace('100x100', '300x300')}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Star size={48} weight="light" />
          </div>
        )}
        
        {/* Delete Button Overlay */}
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-2 bg-text-primary/80 backdrop-blur-sm text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-text-primary"
          title="Remove from library"
        >
          <Trash size={16} weight="bold" />
        </button>
      </div>

      {/* Album Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-text-primary line-clamp-2 leading-tight">
            {album.title}
          </h3>
          <p className="text-sm text-text-muted mt-1">{album.artistName}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {album.genre && (
            <Badge variant="default">{album.genre}</Badge>
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

        {/* Rating Display/Edit */}
        {!isEditing ? (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    weight={star <= (album.userRating || 0) ? 'fill' : 'regular'}
                    className={
                      star <= (album.userRating || 0)
                        ? 'text-accent-yellow-text'
                        : 'text-text-muted'
                    }
                  />
                ))}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-canvas-warm rounded transition-colors"
                title="Edit rating and notes"
              >
                <NotePencil size={16} weight="bold" className="text-text-muted" />
              </button>
            </div>
            {album.userNotes && (
              <p className="text-xs text-text-muted line-clamp-2 italic">
                "{album.userNotes}"
              </p>
            )}
          </div>
        ) : (
          <div className="pt-3 border-t border-border space-y-3">
            {/* Star Rating Editor */}
            <div>
              <label className="text-xs font-medium text-text-primary block mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      weight={star <= rating ? 'fill' : 'regular'}
                      className={
                        star <= rating
                          ? 'text-accent-yellow-text'
                          : 'text-text-muted hover:text-accent-yellow-text'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Editor */}
            <div>
              <label className="text-xs font-medium text-text-primary block mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your thoughts..."
                className="input text-sm resize-none"
                rows={3}
                maxLength={1000}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={saving}
                disabled={saving}
                className="flex-1"
              >
                <Check size={16} weight="bold" />
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                <X size={16} weight="bold" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
