import { GraphQLContext } from "#context";
import { SpotifyPlaylist, SpotifyUser, SpotifyPaginatedResponse, SpotifyTrack } from "#types/spotify";
import { fetchSafeResource } from "#utils/fetch";

interface CreatePlaylistArgs {
  name: string;
  description?: string | null;
  public?: boolean | null;
}

export async function getMyPlaylists(ctx: GraphQLContext, limit?: number, offset?: number) {
  return fetchSafeResource<SpotifyPaginatedResponse<SpotifyPlaylist>>(ctx, `/me/playlists?limit=${limit ?? 20}&offset=${offset ?? 0}`);
}

export async function getPlaylistById(ctx: GraphQLContext, id: string) {
  return fetchSafeResource<SpotifyPlaylist>(ctx, `/playlists/${id}`);
}

export async function getPlaylistTracks(
  ctx: GraphQLContext,
  playlistId: string,
  limit?: number,
  offset?: number
) {
  return fetchSafeResource<SpotifyPaginatedResponse<{ track: SpotifyTrack }>>(ctx, `/playlists/${playlistId}/tracks?limit=${limit ?? 20}&offset=${offset ?? 0}`);
}

export async function createPlaylist(ctx: GraphQLContext, args: CreatePlaylistArgs) {
  const user = await fetchSafeResource<SpotifyUser>(ctx, "/me");
  if (!user) {
    throw new Error("UNAUTHORIZED_SPOTIFY");
  }

  try {
    const { data } = await ctx.spotify.post(`/users/${user.id}/playlists`, {
      name: args.name,
      description: args.description ?? "",
      public: args.public ?? false,
    });
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
      throw new Error("UNAUTHORIZED_SPOTIFY");
    }
    throw error;
  }
}
