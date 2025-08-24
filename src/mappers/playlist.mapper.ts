import { SpotifyPlaylist } from "#types/spotify";
import { createEmptyConnection } from "#utils/pagination";
import { transformUser } from "./user.mapper";

export const transformPlaylist = (playlist: SpotifyPlaylist) => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? null,
  public: playlist.public ?? null,
  images: playlist.images ?? [],
  owner: transformUser(playlist.owner),
  tracks: createEmptyConnection(),
});