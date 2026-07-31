// iTunes API Types
export interface ITunesAlbum {
  collectionId: number;
  artistName: string;
  collectionName: string;
  collectionPrice?: number;
  releaseDate: string;
  trackCount: number;
  primaryGenreName: string;
  artworkUrl100: string;
  artworkUrl60?: string;
  collectionType: string;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesAlbum[];
}

// Database Types
export interface Album {
  id: string;
  userId: string;
  appleCatalogId: string;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: Date | null;
  trackCount: number | null;
  artworkUrl: string | null;
  collectionPrice: number | null;
  userRating: number | null;
  userNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface SearchParams {
  query: string;
  limit?: number;
}

export interface AddToLibraryRequest {
  appleCatalogId: string;
  title: string;
  artistName: string;
  genre?: string;
  releaseDate?: string;
  trackCount?: number;
  artworkUrl?: string;
  collectionPrice?: number;
}

export interface UpdateAlbumRequest {
  userRating?: number;
  userNotes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Analytics Types
export interface GenreDistribution {
  genre: string;
  count: number;
  percentage: number;
}

export interface ArtistCount {
  artistName: string;
  count: number;
}

export interface ReleaseYearData {
  year: number;
  count: number;
}

export interface TrackCountDistribution {
  range: string;
  count: number;
}

export interface AnalyticsData {
  totalAlbums: number;
  totalArtists: number;
  averageRating: number;
  genreDistribution: GenreDistribution[];
  topArtists: ArtistCount[];
  releasesByYear: ReleaseYearData[];
  trackCountDistribution: TrackCountDistribution[];
}

// AI Types
export interface AIRecommendation {
  album: ITunesAlbum;
  reason: string;
  confidence: number;
}

export interface AIInsights {
  summary: string;
  dominantGenres: string[];
  listeningPersonality: string;
  recommendations: AIRecommendation[];
  trends: string[];
}
