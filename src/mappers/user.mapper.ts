import { SpotifyUser } from "#types/spotify";

export const transformUser = (data: SpotifyUser) => ({
  id: data.id,
  displayName: data.display_name,
  images: data.images ?? [],
});
