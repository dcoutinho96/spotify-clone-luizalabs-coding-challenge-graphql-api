import { Resolvers, QueryResolvers, MutationResolvers, PlaylistResolvers } from "#gql/generated";
import { GraphQLContext } from "#context";
import { createConnection } from "#utils/pagination";
import { transformPlaylist } from "#mappers/playlist.mapper";
import { transformTrack } from "#mappers/track.mapper";
import {
  getMyPlaylists,
  getPlaylistById,
  getPlaylistTracks,
  createPlaylist,
} from "#services/spotify/playlist.service";
import { SpotifyPlaylist, SpotifyTrack, SpotifyPaginatedResponse } from "#types/spotify";
import { GraphQLError } from "graphql";

/** Small local helper to produce an empty Relay-style connection */
function emptyConnection<TNode>() {
  return {
    edges: [] as Array<{ cursor: string; node: TNode }>,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null as string | null,
      endCursor: null as string | null,
    },
    totalCount: 0,
  };
}

export const playlistQueryResolvers: QueryResolvers<GraphQLContext> = {
  myPlaylists: async (_p, args, ctx) => {
    if (!ctx.isAuthenticated) {
      return emptyConnection<ReturnType<typeof transformPlaylist>>();
    }

    try {
      const data: SpotifyPaginatedResponse<SpotifyPlaylist> | null = await getMyPlaylists(
        ctx,
        args.limit ?? undefined,
        args.offset ?? undefined
      );

      if (!data) {
        // Service returned null (e.g., upstream issue) — return empty connection
        return emptyConnection<ReturnType<typeof transformPlaylist>>();
      }

      return createConnection(data, args.offset ?? 0, transformPlaylist);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_SPOTIFY") {
        throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        });
      }
      throw new GraphQLError("Spotify API error", {
        extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
      });
    }
  },

  playlistById: async (_p, args, ctx) => {
    try {
      const playlist = await getPlaylistById(ctx, args.id);
      return playlist ? transformPlaylist(playlist) : null;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_SPOTIFY") {
        throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        });
      }
      throw new GraphQLError("Spotify API error", {
        extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
      });
    }
  },
};

export const playlistFieldResolvers: PlaylistResolvers<GraphQLContext> = {
  tracks: async (parent, args, ctx) => {
    try {
      const data: SpotifyPaginatedResponse<{ track: SpotifyTrack }> | null = await getPlaylistTracks(
        ctx,
        parent.id,
        args.limit ?? undefined,
        args.offset ?? undefined
      );

      if (!data) {
        return emptyConnection<ReturnType<typeof transformTrack>>();
      }

      return createConnection<{ track: SpotifyTrack }, ReturnType<typeof transformTrack>>(
        data,
        args.offset ?? 0,
        (item) => transformTrack(item.track)
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_SPOTIFY") {
        throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        });
      }
      throw new GraphQLError("Spotify API error", {
        extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
      });
    }
  },
};

export const playlistMutationResolvers: MutationResolvers<GraphQLContext> = {
  createPlaylist: async (_p, args, ctx) => {
    if (!ctx.isAuthenticated) {
      throw new GraphQLError("Unauthorized: Spotify token missing", {
        extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
      });
    }

    try {
      const playlist: SpotifyPlaylist = await createPlaylist(ctx, {
        name: args.name,
        description: args.description,
        public: args.public ?? false,
      });

      return transformPlaylist(playlist);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_SPOTIFY") {
        throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        });
      }
      throw new GraphQLError("Spotify API error", {
        extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
      });
    }
  },
};

export const playlistResolvers: Resolvers<GraphQLContext> = {
  Query: {
    ...playlistQueryResolvers,
  },
  Playlist: {
    ...playlistFieldResolvers,
  },
  Mutation: {
    ...playlistMutationResolvers,
  },
};
