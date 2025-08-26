export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[] | null;
  popularity: number | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string | null;
  total_tracks: number | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
  owner: {
    id: string;
    display_name: string | null;
    images: Array<{ url: string; height?: number; width?: number }> | null;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface SpotifyUser {
  id: string;
  display_name: string | null; 
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

export interface SpotifyPaginatedResponse<T> {
  items: (T | null)[];
  next: string | null;
  previous: string | null;
  total: number;
}
