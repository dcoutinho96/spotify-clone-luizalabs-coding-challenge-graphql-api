import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

import { GraphQLContext } from "./context.js";
import {
  Resolvers,
} from "./gql/generated";

import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";

export type EnvLike = Partial<
  Record<"NODE_ENV" | "ENV" | "PORT" | "SPOTIFY_API_URL", string>
>;

// Spotify API response types
interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{ url: string; height?: number; width?: number }>;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  total_tracks: number;
  images: Array<{ url: string; height?: number; width?: number }>;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  images: Array<{ url: string; height?: number; width?: number }>;
  owner: {
    id: string;
    display_name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
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
  images: Array<{ url: string; height?: number; width?: number }>;
}

interface SpotifyPaginatedResponse<T> {
  items: T[];
  next: string | null;
  previous: string | null;
  total: number;
}

export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    me: async (_parent, _args, ctx) => {
      const { data }: { data: SpotifyUser } = await ctx.spotify.get("/me");
      return {
        id: data.id,
        displayName: data.display_name,
        images: data.images ?? [],
      };
    },

    myTopArtists: async (_parent, args, ctx) => {
      const { data }: { data: SpotifyPaginatedResponse<SpotifyArtist> } = await ctx.spotify.get("/me/top/artists", {
        params: { 
          limit: args.limit ?? 20, 
          offset: args.offset ?? 0 
        },
      });

      return {
        edges: data.items.map((artist: SpotifyArtist, idx: number) => ({
          cursor: String((args.offset ?? 0) + idx),
          node: {
            id: artist.id,
            name: artist.name,
            genres: artist.genres ?? [],
            popularity: artist.popularity ?? null,
            images: artist.images ?? [],
            albums: {
              edges: [],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
              totalCount: 0,
            },
          },
        })),
        pageInfo: {
          hasNextPage: data.next != null,
          hasPreviousPage: data.previous != null,
          startCursor: data.items.length > 0 ? String(args.offset ?? 0) : null,
          endCursor: data.items.length > 0 ? String((args.offset ?? 0) + data.items.length - 1) : null,
        },
        totalCount: data.total,
      };
    },

    artistById: async (_parent, args, ctx) => {
      try {
        const { data }: { data: SpotifyArtist } = await ctx.spotify.get(`/artists/${args.id}`);
        return {
          id: data.id,
          name: data.name,
          genres: data.genres ?? [],
          popularity: data.popularity ?? null,
          images: data.images ?? [],
          albums: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        };
      } catch {
        return null;
      }
    },

    artistAlbums: async (_parent, args, ctx) => {
      const { data }: { data: SpotifyPaginatedResponse<SpotifyAlbum> } = await ctx.spotify.get(`/artists/${args.artistId}/albums`, {
        params: { 
          limit: args.limit ?? 20, 
          offset: args.offset ?? 0 
        },
      });

      return {
        edges: data.items.map((album: SpotifyAlbum, idx: number) => ({
          cursor: String((args.offset ?? 0) + idx),
          node: {
            id: album.id,
            name: album.name,
            releaseDate: album.release_date ?? null,
            totalTracks: album.total_tracks ?? null,
            images: album.images ?? [],
          },
        })),
        pageInfo: {
          hasNextPage: data.next != null,
          hasPreviousPage: data.previous != null,
          startCursor: data.items.length > 0 ? String(args.offset ?? 0) : null,
          endCursor: data.items.length > 0 ? String((args.offset ?? 0) + data.items.length - 1) : null,
        },
        totalCount: data.total,
      };
    },

    myPlaylists: async (_parent, args, ctx) => {
      const { data }: { data: SpotifyPaginatedResponse<SpotifyPlaylist> } = await ctx.spotify.get("/me/playlists", {
        params: { 
          limit: args.limit ?? 20, 
          offset: args.offset ?? 0 
        },
      });

      return {
        edges: data.items.map((playlist: SpotifyPlaylist, idx: number) => ({
          cursor: String((args.offset ?? 0) + idx),
          node: {
            id: playlist.id,
            name: playlist.name,
            description: playlist.description ?? null,
            public: playlist.public ?? null,
            images: playlist.images ?? [],
            owner: {
              id: playlist.owner.id,
              displayName: playlist.owner.display_name,
              images: playlist.owner.images ?? [],
            },
            tracks: {
              edges: [],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
              totalCount: 0,
            },
          },
        })),
        pageInfo: {
          hasNextPage: data.next != null,
          hasPreviousPage: data.previous != null,
          startCursor: data.items.length > 0 ? String(args.offset ?? 0) : null,
          endCursor: data.items.length > 0 ? String((args.offset ?? 0) + data.items.length - 1) : null,
        },
        totalCount: data.total,
      };
    },

    playlistById: async (_parent, args, ctx) => {
      try {
        const { data }: { data: SpotifyPlaylist } = await ctx.spotify.get(`/playlists/${args.id}`);
        return {
          id: data.id,
          name: data.name,
          description: data.description ?? null,
          public: data.public ?? null,
          images: data.images ?? [],
          owner: {
            id: data.owner.id,
            displayName: data.owner.display_name,
            images: data.owner.images ?? [],
          },
          tracks: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        };
      } catch {
        return null;
      }
    },
  },

  Artist: {
    albums: async (parent, args, ctx) => {
      const { data }: { data: SpotifyPaginatedResponse<SpotifyAlbum> } = await ctx.spotify.get(`/artists/${parent.id}/albums`, {
        params: { 
          limit: args.limit ?? 20, 
          offset: args.offset ?? 0 
        },
      });

      return {
        edges: data.items.map((album: SpotifyAlbum, idx: number) => ({
          cursor: String((args.offset ?? 0) + idx),
          node: {
            id: album.id,
            name: album.name,
            releaseDate: album.release_date ?? null,
            totalTracks: album.total_tracks ?? null,
            images: album.images ?? [],
          },
        })),
        pageInfo: {
          hasNextPage: data.next != null,
          hasPreviousPage: data.previous != null,
          startCursor: data.items.length > 0 ? String(args.offset ?? 0) : null,
          endCursor: data.items.length > 0 ? String((args.offset ?? 0) + data.items.length - 1) : null,
        },
        totalCount: data.total,
      };
    },
  },

  Playlist: {
    tracks: async (parent, args, ctx) => {
      const { data }: { data: SpotifyPaginatedResponse<{ track: SpotifyTrack }> } = await ctx.spotify.get(`/playlists/${parent.id}/tracks`, {
        params: { 
          limit: args.limit ?? 20, 
          offset: args.offset ?? 0 
        },
      });

      return {
        edges: data.items.map((item: { track: SpotifyTrack }, idx: number) => ({
          cursor: String((args.offset ?? 0) + idx),
          node: {
            id: item.track.id,
            name: item.track.name,
            durationMs: item.track.duration_ms,
            previewUrl: item.track.preview_url ?? null,
            artists: item.track.artists.map((artist: SpotifyArtist) => ({
              id: artist.id,
              name: artist.name,
              genres: artist.genres ?? [],
              popularity: artist.popularity ?? null,
              images: artist.images ?? [],
              albums: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                  endCursor: null,
                },
                totalCount: 0,
              },
            })),
            album: {
              id: item.track.album.id,
              name: item.track.album.name,
              releaseDate: item.track.album.release_date ?? null,
              totalTracks: item.track.album.total_tracks ?? null,
              images: item.track.album.images ?? [],
            },
          },
        })),
        pageInfo: {
          hasNextPage: data.next != null,
          hasPreviousPage: data.previous != null,
          startCursor: data.items.length > 0 ? String(args.offset ?? 0) : null,
          endCursor: data.items.length > 0 ? String((args.offset ?? 0) + data.items.length - 1) : null,
        },
        totalCount: data.total,
      };
    },
  },

  Mutation: {
    createPlaylist: async (_parent, args, ctx) => {
      const { data: user }: { data: SpotifyUser } = await ctx.spotify.get("/me");
      const { data }: { data: SpotifyPlaylist } = await ctx.spotify.post(`/users/${user.id}/playlists`, {
        name: args.name,
        description: args.description,
        public: args.public ?? false,
      });

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        public: data.public ?? null,
        images: data.images ?? [],
        owner: {
          id: data.owner.id,
          displayName: data.owner.display_name,
          images: data.owner.images ?? [],
        },
        tracks: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
      };
    },
  },
};

export function createApolloServer(
  env?: EnvLike
): ApolloServer<GraphQLContext> {
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