import { GraphQLContext } from "#context";
import { SpotifyAlbum, SpotifyPaginatedResponse, SpotifyTrack } from "#types/spotify";
import { fetchSafeResource } from "#utils/fetch";
import { getPaginatedData } from "#utils/pagination";

export async function getAlbumById(ctx: GraphQLContext, id: string): Promise<SpotifyAlbum | null> {
  return fetchSafeResource<SpotifyAlbum>(ctx, `/albums/${id}`);
}

export async function getAlbumTracks(
  ctx: GraphQLContext,
  albumId: string,
  limit?: number,
  offset?: number
): Promise<SpotifyPaginatedResponse<SpotifyTrack>> {
  return getPaginatedData<SpotifyTrack>(ctx, `/albums/${albumId}/tracks`, limit, offset);
}
