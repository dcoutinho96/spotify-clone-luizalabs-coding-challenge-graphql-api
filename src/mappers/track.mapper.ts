import { SpotifyTrack } from "#types/spotify";
import { transformAlbum } from "./album.mapper";
import { transformArtist } from "./artist.mapper";

export const transformTrack = (track: SpotifyTrack) => ({
  id: track.id,
  name: track.name,
  durationMs: track.duration_ms,
  previewUrl: track.preview_url ?? null,
  artists: track.artists.map(transformArtist),
  album: transformAlbum(track.album),
});