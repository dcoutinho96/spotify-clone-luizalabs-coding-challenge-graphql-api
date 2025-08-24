import { SpotifyArtist } from "#types/spotify";
import { createEmptyConnection } from "#utils/pagination";

export const transformArtist = (artist: SpotifyArtist) => ({
  id: artist.id,
  name: artist.name,
  genres: artist.genres ?? [],
  popularity: artist.popularity ?? null,
  images: artist.images ?? [],
  albums: createEmptyConnection(),
});