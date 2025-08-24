import { GraphQLContext } from "#context";
import { SpotifyAlbum, SpotifyArtist, SpotifyPaginatedResponse } from "#types/spotify";
import { fetchSafeResource } from "#utils/fetch";
import { getPaginatedData } from "#utils/pagination";

export async function getArtistById(ctx: GraphQLContext, id: string): Promise<SpotifyArtist | null> {
  return fetchSafeResource<SpotifyArtist>(ctx, `/artists/${id}`);
}

export async function getArtistAlbums(
  ctx: GraphQLContext,
  artistId: string,
  limit?: number,
  offset?: number
): Promise<SpotifyPaginatedResponse<SpotifyAlbum>> {
  return getPaginatedData<SpotifyAlbum>(ctx, `/artists/${artistId}/albums`, limit, offset);
}
