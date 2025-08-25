import { QueryResolvers } from "#gql/generated";
import { GraphQLContext } from "#context";
import { transformUser } from "#mappers/user.mapper";
import { GraphQLError } from "graphql";
import { getMe, getMyTopArtists } from "#services/spotify/user.service";
import { createConnection } from "#utils/pagination";
import { transformArtist } from "#mappers/artist.mapper";

function handleSpotifyError(err: unknown): never {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED_SPOTIFY") {
      throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
        extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
      });
    }
    if (err.message === "NOT_FOUND_SPOTIFY") {
      throw new GraphQLError("Resource not found on Spotify", {
        extensions: { code: "NOT_FOUND_SPOTIFY", http: { status: 404 } },
      });
    }
  }
  throw new GraphQLError("Spotify API error", {
    extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
  });
}

export const userQueryResolvers: QueryResolvers<GraphQLContext> = {
  me: async (_p, _a, ctx) => {
    if (!ctx.token || !ctx.isAuthenticated) {
      throw new GraphQLError("Unauthorized: Spotify token missing", {
        extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
      });
    }

    try {
      const user = await getMe(ctx);
      if (!user) {
        throw new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        });
      }
      return transformUser(user);
    } catch (err: unknown) {
      handleSpotifyError(err);
    }
  },

  myTopArtists: async (_p, args, ctx) => {
    if (!ctx.token || !ctx.isAuthenticated) {
      throw new GraphQLError("Unauthorized: Spotify token missing", {
        extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
      });
    }

    try {
      const data = await getMyTopArtists(
        ctx,
        args.limit ?? undefined,
        args.offset ?? undefined
      );
      return createConnection(data, args.offset ?? 0, transformArtist);
    } catch (err: unknown) {
      handleSpotifyError(err);
    }
  },
};
