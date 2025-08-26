import { SpotifyPlaylist, SpotifyUser } from "#types/spotify";
import { createEmptyConnection } from "#utils/pagination";

function safeTransformUser(user: SpotifyUser | null | undefined) {
  if (!user) {
    return {
      id: "unknown",
      displayName: "Unknown User",
      images: [],
      __typename: "User" as const,
    };
  }

  return {
    id: user.id ?? "unknown",
    displayName: user.display_name ?? user.id ?? "Unknown User",
    images: user.images ?? [],
    __typename: "User" as const,
  };
}

export const transformPlaylist = (playlist: SpotifyPlaylist) => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? null,
  public: playlist.public ?? null,
  images: playlist.images ?? [],
  owner: safeTransformUser(playlist.owner),
  tracks: createEmptyConnection(),
});
