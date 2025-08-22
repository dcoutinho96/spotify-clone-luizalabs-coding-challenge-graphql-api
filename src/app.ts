import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

import { GraphQLContext } from "./context.js";
import { Resolvers } from "./gql/generated";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";

export type EnvLike = Partial<
  Record<"NODE_ENV" | "ENV" | "PORT" | "SPOTIFY_API_URL", string>
>;

// Spotify API response types
interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[] | null;
  popularity: number | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string | null;
  total_tracks: number | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean | null;
  images: Array<{ url: string; height?: number; width?: number }> | null;
  owner: {
    id: string;
    display_name: string;
    images: Array<{ url: string; height?: number; width?: number }> | null;
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

interface SpotifyUser {
  id: string;
  display_name: string;
  images: Array<{ url: string; height?: number; width?: number }> | null;
}

interface SpotifyPaginatedResponse<T> {
  items: (T | null)[];
  next: string | null;
  previous: string | null;
  total: number;
}

// --------------------
// Helpers
// --------------------
const createEmptyConnection = () => ({
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: 0,
});

const createPageInfo = <T>(
  data: SpotifyPaginatedResponse<T>,
  offset: number,
  itemsLength: number
) => ({
  hasNextPage: data.next != null,
  hasPreviousPage: data.previous != null,
  startCursor: itemsLength > 0 ? String(offset) : null,
  endCursor: itemsLength > 0 ? String(offset + itemsLength - 1) : null,
});

const createConnection = <T, R>(
  data: SpotifyPaginatedResponse<T>,
  offset: number,
  transformer: (item: T, index: number) => R
) => {
  const validItems = (data.items ?? []).filter(
    (item): item is T => item != null
  );
  return {
    edges: validItems.map((item, idx) => ({
      cursor: String(offset + idx),
      node: transformer(item, idx),
    })),
    pageInfo: createPageInfo(data, offset, validItems.length),
    totalCount: data.total,
  };
};

// --------------------
// Transformers
// --------------------
const transformUser = (data: SpotifyUser) => ({
  id: data.id,
  displayName: data.display_name,
  images: data.images ?? [],
});

const transformArtist = (artist: SpotifyArtist) => ({
  id: artist.id,
  name: artist.name,
  genres: artist.genres ?? [],
  popularity: artist.popularity ?? null,
  images: artist.images ?? [],
  albums: createEmptyConnection(),
});

const transformAlbum = (album: SpotifyAlbum) => ({
  id: album.id,
  name: album.name,
  releaseDate: album.release_date ?? null,
  totalTracks: album.total_tracks ?? null,
  images: album.images ?? [],
});

const transformPlaylist = (playlist: SpotifyPlaylist) => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? null,
  public: playlist.public ?? null,
  images: playlist.images ?? [],
  owner: transformUser(playlist.owner),
  tracks: createEmptyConnection(),
});

const transformTrack = (track: SpotifyTrack) => ({
  id: track.id,
  name: track.name,
  durationMs: track.duration_ms,
  previewUrl: track.preview_url ?? null,
  artists: track.artists.map(transformArtist),
  album: transformAlbum(track.album),
});

// --------------------
// API helpers
// --------------------
const getPaginatedData = async <T>(
  ctx: GraphQLContext,
  endpoint: string,
  limit?: number | null,
  offset?: number | null
): Promise<SpotifyPaginatedResponse<T>> => {
  const { data } = await ctx.spotify.get(endpoint, {
    params: {
      limit: limit ?? 20,
      offset: offset ?? 0,
    },
  });
  return data;
};

const fetchSafeResource = async <T>(
  ctx: GraphQLContext,
  endpoint: string
): Promise<T | null> => {
  try {
    const { data } = await ctx.spotify.get(endpoint);
    return data;
  } catch {
    return null;
  }
};

// --------------------
// Resolvers
// --------------------
export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    me: async (_parent, _args, ctx) => {
      if (!ctx.isAuthenticated) return null;
      const data = await ctx.spotify.get("/me");
      return transformUser(data.data);
    },

    myTopArtists: async (_parent, args, ctx) => {
      if (!ctx.isAuthenticated) return createEmptyConnection();
      const data = await getPaginatedData<SpotifyArtist>(
        ctx,
        "/me/top/artists",
        args.limit,
        args.offset
      );
      return createConnection(data, args.offset ?? 0, transformArtist);
    },

    artistById: async (_parent, args, ctx) => {
      const data = await fetchSafeResource<SpotifyArtist>(
        ctx,
        `/artists/${args.id}`
      );
      return data ? transformArtist(data) : null;
    },

    artistAlbums: async (_parent, args, ctx) => {
      const data = await getPaginatedData<SpotifyAlbum>(
        ctx,
        `/artists/${args.artistId}/albums`,
        args.limit,
        args.offset
      );
      return createConnection(data, args.offset ?? 0, transformAlbum);
    },

    myPlaylists: async (_parent, args, ctx) => {
      if (!ctx.isAuthenticated) return createEmptyConnection();
      const data = await getPaginatedData<SpotifyPlaylist>(
        ctx,
        "/me/playlists",
        args.limit,
        args.offset
      );
      return createConnection(data, args.offset ?? 0, transformPlaylist);
    },

    playlistById: async (_parent, args, ctx) => {
      const data = await fetchSafeResource<SpotifyPlaylist>(
        ctx,
        `/playlists/${args.id}`
      );
      return data ? transformPlaylist(data) : null;
    },
  },

  Artist: {
    albums: async (parent, args, ctx) => {
      const data = await getPaginatedData<SpotifyAlbum>(
        ctx,
        `/artists/${parent.id}/albums`,
        args.limit,
        args.offset
      );
      return createConnection(data, args.offset ?? 0, transformAlbum);
    },
  },

  Playlist: {
    tracks: async (parent, args, ctx) => {
      const data = await getPaginatedData<{ track: SpotifyTrack }>(
        ctx,
        `/playlists/${parent.id}/tracks`,
        args.limit,
        args.offset
      );
      return createConnection(data, args.offset ?? 0, (item) =>
        transformTrack(item.track)
      );
    },
  },

  Mutation: {
    createPlaylist: async (_parent, args, ctx) => {
      if (!ctx.isAuthenticated) throw new Error("Authentication required");

      const userData = await ctx.spotify.get("/me");
      const user = userData.data as SpotifyUser;

      const playlistData = await ctx.spotify.post(
        `/users/${user.id}/playlists`,
        {
          name: args.name,
          description: args.description,
          public: args.public ?? false,
        }
      );

      return transformPlaylist(playlistData.data);
    },
  },
};

// --------------------
// Apollo server factory
// --------------------
export function createApolloServer(env?: EnvLike): ApolloServer<GraphQLContext> {
  const e = { ...process.env, ...env } as Record<string, string | undefined>;

  const isDev = e.NODE_ENV !== "production";
  const isBeta = e.ENV === "BETA";
  const isBetaOrDev = isDev || isBeta;

  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [
      isBetaOrDev
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
  });
}
