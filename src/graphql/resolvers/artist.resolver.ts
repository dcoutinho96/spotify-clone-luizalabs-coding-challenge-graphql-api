import { GraphQLContext } from "#context";
import { ArtistResolvers, QueryResolvers } from "#gql/generated";
import { transformAlbum } from "#mappers/album.mapper";
import { transformArtist } from "#mappers/artist.mapper";
import { getArtistAlbums, getArtistById } from "#services/spotify/artist.service";
import { createConnection } from "#utils/pagination";
import { SPOTIFY_ERRORS, handleSpotifyError } from "#utils/error";

const asUndef = <T>(v: T | null | undefined) => (v ?? undefined);

export const artistQueryResolvers: QueryResolvers<GraphQLContext> = {
  artistById: async (_p, { id }, ctx) => {
    try {
      const data = await getArtistById(ctx, id);
      if (!data) {
        throw new Error(SPOTIFY_ERRORS.NOT_FOUND);
      }
      return transformArtist(data);
    } catch (err: unknown) {
      handleSpotifyError(err);
    }
  },

  artistAlbums: async (_p, { artistId, limit, offset }, ctx) => {
    try {
      const data = await getArtistAlbums(ctx, artistId, asUndef(limit), asUndef(offset));
      if (!data) {
        throw new Error(SPOTIFY_ERRORS.NOT_FOUND);
      }
      return createConnection(data, offset ?? 0, transformAlbum);
    } catch (err: unknown) {
      handleSpotifyError(err);
    }
  },
};

export const artistFieldResolvers: ArtistResolvers<GraphQLContext> = {
  albums: async (parent, { limit, offset }, ctx) => {
    try {
      const data = await getArtistAlbums(ctx, parent.id, asUndef(limit), asUndef(offset));
      if (!data) {
        throw new Error(SPOTIFY_ERRORS.NOT_FOUND);
      }
      return createConnection(data, offset ?? 0, transformAlbum);
    } catch (err: unknown) {
      handleSpotifyError(err);
    }
  },
};
