import { GraphQLContext } from "#context";
import { SpotifyPaginatedResponse } from "#types/spotify";
import { GraphQLError } from "graphql";

export const createEmptyConnection = () => ({
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: 0,
});

export const createPageInfo = <T>(data: SpotifyPaginatedResponse<T>, offset: number, itemsLength: number) => ({
  hasNextPage: data.next != null,
  hasPreviousPage: data.previous != null,
  startCursor: itemsLength > 0 ? String(offset) : null,
  endCursor: itemsLength > 0 ? String(offset + itemsLength - 1) : null,
});

export const createConnection = <T, R>(
  data: SpotifyPaginatedResponse<T>,
  offset: number,
  transformer: (item: T, index: number) => R
) => {
  const validItems = (data.items ?? []).filter((item): item is T => item != null);
  return {
    edges: validItems.map((item, idx) => ({
      cursor: String(offset + idx),
      node: transformer(item, idx),
    })),
    pageInfo: createPageInfo(data, offset, validItems.length),
    totalCount: data.total,
  };
};

export async function getPaginatedData<T>(
  ctx: GraphQLContext,
  endpoint: string,
  limit?: number | null,
  offset?: number | null
): Promise<SpotifyPaginatedResponse<T>> {
  try {
    const { data } = await ctx.spotify.get(endpoint, {
      params: { limit: limit ?? 20, offset: offset ?? 0 },
    });
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && ('isUnauthenticated' in error || ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401))) {
      throw new Error("UNAUTHORIZED_SPOTIFY");
    }
    throw new GraphQLError("Spotify API request failed", {
      extensions: { code: "SPOTIFY_API_ERROR" },
    });
  }
}
