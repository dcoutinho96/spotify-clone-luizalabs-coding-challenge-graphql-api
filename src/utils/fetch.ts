import { GraphQLContext } from "#context";
import { extractSpotifyStatus } from "./error";

export async function fetchSafeResource<T>(
  ctx: GraphQLContext,
  endpoint: string
): Promise<T> {
  try {
    const { data } = await ctx.spotify.get(endpoint);
    return data;
  } catch (err) {
    const status = extractSpotifyStatus(err);

    if (status === 401) throw new Error("UNAUTHORIZED_SPOTIFY");
    if (status && status >= 400 && status < 500) throw new Error("NOT_FOUND_SPOTIFY");
    throw new Error("SPOTIFY_API_ERROR");
  }
}