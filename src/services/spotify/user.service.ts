import { GraphQLContext } from "#context";
import { SpotifyArtist, SpotifyPaginatedResponse, SpotifyUser } from "#types/spotify";
import { fetchSafeResource } from "#utils/fetch";
import { getPaginatedData } from "#utils/pagination";

export async function getMe(ctx: GraphQLContext): Promise<SpotifyUser | null> {
  return fetchSafeResource<SpotifyUser>(ctx, "/me");
}

export async function getMyTopArtists(
  ctx: GraphQLContext,
  limit?: number,
  offset?: number
): Promise<SpotifyPaginatedResponse<SpotifyArtist>> {
  return getPaginatedData<SpotifyArtist>(ctx, "/me/top/artists", limit, offset);
}
