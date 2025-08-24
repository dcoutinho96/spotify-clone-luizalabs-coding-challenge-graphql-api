import { SpotifyAlbum } from "#types/spotify";

export const transformAlbum = (album: SpotifyAlbum) => ({
  id: album.id,
  name: album.name,
  releaseDate: album.release_date ?? null,
  totalTracks: album.total_tracks ?? null,
  images: album.images ?? [],
});