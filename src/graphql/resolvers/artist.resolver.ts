import { GraphQLContext } from "#context";
import { ArtistResolvers, QueryResolvers } from "#gql/generated";
import { transformAlbum } from "#mappers/album.mapper";
import { transformArtist } from "#mappers/artist.mapper";
import { getArtistAlbums, getArtistById } from "#services/spotify/artist.service";
import { createConnection } from "#utils/pagination";
import { GraphQLError } from "graphql";

const asUndef = <T>(v: T | null | undefined) => (v ?? undefined);

export const artistQueryResolvers: QueryResolvers<GraphQLContext> = {
  artistById: async (_p, { id }, ctx) => {
    try {
      const data = await getArtistById(ctx, id);
      return data ? transformArtist(data) : null;
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

  artistAlbums: async (_p, { artistId, limit, offset }, ctx) => {
    try {
      const data = await getArtistAlbums(ctx, artistId, asUndef(limit), asUndef(offset));
      return createConnection(data, offset ?? 0, transformAlbum);
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

export const artistFieldResolvers: ArtistResolvers<GraphQLContext> = {
  albums: async (parent, { limit, offset }, ctx) => {
    try {
      const data = await getArtistAlbums(ctx, parent.id, asUndef(limit), asUndef(offset));
      return createConnection(data, offset ?? 0, transformAlbum);
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
