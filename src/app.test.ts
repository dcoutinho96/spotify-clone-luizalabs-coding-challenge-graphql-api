import { resolvers } from '../src/app';
import { GraphQLContext } from '../src/context';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// -------------------- 
// Base Spotify API objects (snake_case)
// -------------------- 
const BASE_USER_API = {
  id: 'user123',
  display_name: 'Test User',
  images: [{ url: 'http://example.com/user.jpg', height: 300, width: 300 }],
};

const BASE_ARTIST_API = {
  id: 'artist123',
  name: 'Test Artist',
  genres: ['rock'],
  popularity: 75,
  images: [{ url: 'http://example.com/artist.jpg' }],
};

const BASE_ALBUM_API = {
  id: 'album1',
  name: 'Album 1',
  release_date: '2023-01-01',
  total_tracks: 12,
  images: [{ url: 'http://example.com/album1.jpg' }],
};

const BASE_TRACK_API = {
  id: 'track1',
  name: 'Track 1',
  duration_ms: 180000,
  preview_url: 'http://example.com/preview.mp3',
};

const BASE_PLAYLIST_API = {
  id: 'playlist123',
  name: 'Test Playlist',
  description: 'A test playlist',
  public: false,
  images: [{ url: 'http://example.com/playlist.jpg' }],
  owner: BASE_USER_API,
};

// -------------------- 
// Expected GraphQL objects (camelCase)
// -------------------- 
const EXPECTED_USER = {
  id: BASE_USER_API.id,
  displayName: BASE_USER_API.display_name,
  images: BASE_USER_API.images,
};

const EXPECTED_ARTIST = {
  ...BASE_ARTIST_API,
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

const EXPECTED_ALBUM = {
  id: BASE_ALBUM_API.id,
  name: BASE_ALBUM_API.name,
  releaseDate: BASE_ALBUM_API.release_date,
  totalTracks: BASE_ALBUM_API.total_tracks,
  images: BASE_ALBUM_API.images,
};

const EXPECTED_TRACK = {
  id: BASE_TRACK_API.id,
  name: BASE_TRACK_API.name,
  durationMs: BASE_TRACK_API.duration_ms,
  previewUrl: BASE_TRACK_API.preview_url,
  album: { ...EXPECTED_ALBUM },
  artists: [EXPECTED_ARTIST], //
};

const EXPECTED_PLAYLIST = {
  id: BASE_PLAYLIST_API.id,
  name: BASE_PLAYLIST_API.name,
  description: BASE_PLAYLIST_API.description,
  public: BASE_PLAYLIST_API.public,
  images: BASE_PLAYLIST_API.images,
  owner: EXPECTED_USER,
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

// -------------------- 
// Helpers
// -------------------- 
const createMockContext = (
  mockSpotifyResponse: any = {},
  shouldReject = false
): GraphQLContext => ({
  token: 'mock-token',
  spotify: {
    get: vi.fn().mockImplementation(() =>
      shouldReject
        ? Promise.reject(new Error('API Error'))
        : Promise.resolve(mockSpotifyResponse)
    ),
    post: vi.fn().mockImplementation(() =>
      shouldReject
        ? Promise.reject(new Error('API Error'))
        : Promise.resolve(mockSpotifyResponse)
    ),
  } as any,
});

// -------------------- 
// Tests
// -------------------- 
describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query resolvers', () => {
    describe('me', () => {
      it('should return user data with all fields', async () => {
        const ctx = createMockContext({ data: BASE_USER_API });
        const meResolver = resolvers.Query?.me;
        if (typeof meResolver === 'function') {
          const result = await meResolver({}, {}, ctx, {} as any);
          expect(result).toEqual(EXPECTED_USER);
          expect(ctx.spotify.get).toHaveBeenCalledWith('/me');
        }
      });

      it('should handle user with no images', async () => {
        const ctx = createMockContext({
          data: { ...BASE_USER_API, images: null },
        });
        const meResolver = resolvers.Query?.me;
        if (typeof meResolver === 'function') {
          const result = await meResolver({}, {}, ctx, {} as any);
          expect(result.images).toEqual([]);
        }
      });

      it('should handle API errors gracefully', async () => {
        const ctx = createMockContext({}, true);
        const meResolver = resolvers.Query?.me;
        if (typeof meResolver === 'function') {
          await expect(meResolver({}, {}, ctx, {} as any)).rejects.toThrow(
            'API Error'
          );
        }
      });
    });

    describe('myTopArtists', () => {
      it('should return paginated artists with default parameters', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_ARTIST_API],
            next: 'next-url',
            previous: null,
            total: 1,
          },
        });
        const myTopArtistsResolver = resolvers.Query?.myTopArtists;
        if (typeof myTopArtistsResolver === 'function') {
          const result = await myTopArtistsResolver({}, {}, ctx, {} as any);
          expect(result.edges).toHaveLength(1);
          expect(result.edges[0].node).toMatchObject({
            id: BASE_ARTIST_API.id,
            name: BASE_ARTIST_API.name,
            genres: BASE_ARTIST_API.genres,
            popularity: BASE_ARTIST_API.popularity,
            images: BASE_ARTIST_API.images,
          });
          expect(result.pageInfo.hasNextPage).toBe(true);
          expect(result.totalCount).toBe(1);
          expect(ctx.spotify.get).toHaveBeenCalledWith('/me/top/artists', {
            params: { limit: 20, offset: 0 },
          });
        }
      });

      it('should handle custom limit and offset', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_ARTIST_API],
            next: null,
            previous: 'prev-url',
            total: 1,
          },
        });
        const args = { limit: 10, offset: 5 };
        const myTopArtistsResolver = resolvers.Query?.myTopArtists;
        if (typeof myTopArtistsResolver === 'function') {
          const result = await myTopArtistsResolver({}, args, ctx, {} as any);
          expect(result.pageInfo.hasPreviousPage).toBe(true);
          expect(result.pageInfo.hasNextPage).toBe(false);
          expect(ctx.spotify.get).toHaveBeenCalledWith('/me/top/artists', {
            params: { limit: 10, offset: 5 },
          });
        }
      });

      it('should handle empty artist list', async () => {
        const ctx = createMockContext({
          data: {
            items: [],
            next: null,
            previous: null,
            total: 0,
          },
        });
        const myTopArtistsResolver = resolvers.Query?.myTopArtists;
        if (typeof myTopArtistsResolver === 'function') {
          const result = await myTopArtistsResolver({}, {}, ctx, {} as any);
          expect(result.edges).toHaveLength(0);
          expect(result.pageInfo.startCursor).toBeNull();
          expect(result.pageInfo.endCursor).toBeNull();
        }
      });
    });

    describe('artistById', () => {
      it('should return artist data when found', async () => {
        const ctx = createMockContext({ data: BASE_ARTIST_API });
        const args = { id: BASE_ARTIST_API.id };
        const artistByIdResolver = resolvers.Query?.artistById;
        if (typeof artistByIdResolver === 'function') {
          const result = await artistByIdResolver({}, args, ctx, {} as any);
          expect(result).toEqual(EXPECTED_ARTIST);
          expect(ctx.spotify.get).toHaveBeenCalledWith(`/artists/${BASE_ARTIST_API.id}`);
        }
      });

      it('should return null when artist not found', async () => {
        const ctx = createMockContext({}, true);
        const args = { id: 'nonexistent' };
        const artistByIdResolver = resolvers.Query?.artistById;
        if (typeof artistByIdResolver === 'function') {
          const result = await artistByIdResolver({}, args, ctx, {} as any);
          expect(result).toBeNull();
        }
      });
    });

    describe('artistAlbums', () => {
      it('should return paginated albums for artist', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_ALBUM_API],
            next: 'next-url',
            previous: null,
            total: 1,
          },
        });
        const args = { artistId: BASE_ARTIST_API.id };
        const artistAlbumsResolver = resolvers.Query?.artistAlbums;
        if (typeof artistAlbumsResolver === 'function') {
          const result = await artistAlbumsResolver({}, args, ctx, {} as any);
          expect(result.edges).toHaveLength(1);
          expect(result.edges[0].node).toEqual(EXPECTED_ALBUM);
          expect(ctx.spotify.get).toHaveBeenCalledWith(
            `/artists/${BASE_ARTIST_API.id}/albums`,
            { params: { limit: 20, offset: 0 } }
          );
        }
      });

      it('should handle custom pagination parameters', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_ALBUM_API],
            next: null,
            previous: null,
            total: 1,
          },
        });
        const args = { artistId: BASE_ARTIST_API.id, limit: 5, offset: 10 };
        const artistAlbumsResolver = resolvers.Query?.artistAlbums;
        if (typeof artistAlbumsResolver === 'function') {
          await artistAlbumsResolver({}, args, ctx, {} as any);
          expect(ctx.spotify.get).toHaveBeenCalledWith(
            `/artists/${BASE_ARTIST_API.id}/albums`,
            { params: { limit: 5, offset: 10 } }
          );
        }
      });
    });

    describe('myPlaylists', () => {
      it('should return paginated playlists', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_PLAYLIST_API],
            next: null,
            previous: null,
            total: 1,
          },
        });
        const myPlaylistsResolver = resolvers.Query?.myPlaylists;
        if (typeof myPlaylistsResolver === 'function') {
          const result = await myPlaylistsResolver({}, {}, ctx, {} as any);
          expect(result.edges).toHaveLength(1);
          expect(result.edges[0].node).toMatchObject({
            id: BASE_PLAYLIST_API.id,
            name: BASE_PLAYLIST_API.name,
            description: BASE_PLAYLIST_API.description,
            public: BASE_PLAYLIST_API.public,
            images: BASE_PLAYLIST_API.images,
            owner: EXPECTED_USER,
          });
          expect(ctx.spotify.get).toHaveBeenCalledWith('/me/playlists', {
            params: { limit: 20, offset: 0 },
          });
        }
      });

      it('should handle custom pagination', async () => {
        const ctx = createMockContext({
          data: {
            items: [],
            next: null,
            previous: null,
            total: 0,
          },
        });
        const args = { limit: 15, offset: 30 };
        const myPlaylistsResolver = resolvers.Query?.myPlaylists;
        if (typeof myPlaylistsResolver === 'function') {
          await myPlaylistsResolver({}, args, ctx, {} as any);
          expect(ctx.spotify.get).toHaveBeenCalledWith('/me/playlists', {
            params: { limit: 15, offset: 30 },
          });
        }
      });
    });

    describe('playlistById', () => {
      it('should return playlist data when found', async () => {
        const ctx = createMockContext({ data: BASE_PLAYLIST_API });
        const args = { id: BASE_PLAYLIST_API.id };
        const playlistByIdResolver = resolvers.Query?.playlistById;
        if (typeof playlistByIdResolver === 'function') {
          const result = await playlistByIdResolver({}, args, ctx, {} as any);
          expect(result).toEqual(EXPECTED_PLAYLIST);
          expect(ctx.spotify.get).toHaveBeenCalledWith(`/playlists/${BASE_PLAYLIST_API.id}`);
        }
      });

      it('should return null when playlist not found', async () => {
        const ctx = createMockContext({}, true);
        const args = { id: 'nonexistent' };
        const playlistByIdResolver = resolvers.Query?.playlistById;
        if (typeof playlistByIdResolver === 'function') {
          const result = await playlistByIdResolver({}, args, ctx, {} as any);
          expect(result).toBeNull();
        }
      });
    });
  });

  describe('Artist resolver', () => {
    describe('albums', () => {
      it('should return artist albums with pagination', async () => {
        const ctx = createMockContext({
          data: {
            items: [BASE_ALBUM_API],
            next: null,
            previous: null,
            total: 1,
          },
        });
        const parent = EXPECTED_ARTIST;
        const albumsResolver = resolvers.Artist?.albums;
        if (typeof albumsResolver === 'function') {
          const result = await albumsResolver(parent, {}, ctx, {} as any);
          expect(result.edges).toHaveLength(1);
          expect(result.edges[0].node).toEqual(EXPECTED_ALBUM);
          expect(ctx.spotify.get).toHaveBeenCalledWith(
            `/artists/${BASE_ARTIST_API.id}/albums`,
            { params: { limit: 20, offset: 0 } }
          );
        }
      });

      it('should handle custom pagination parameters', async () => {
        const ctx = createMockContext({
          data: {
            items: [],
            next: null,
            previous: null,
            total: 0,
          },
        });
        const parent = EXPECTED_ARTIST;
        const args = { limit: 5, offset: 15 };
        const albumsResolver = resolvers.Artist?.albums;
        if (typeof albumsResolver === 'function') {
          await albumsResolver(parent, args, ctx, {} as any);
          expect(ctx.spotify.get).toHaveBeenCalledWith(
            `/artists/${BASE_ARTIST_API.id}/albums`,
            { params: { limit: 5, offset: 15 } }
          );
        }
      });
    });
  });

  describe('Playlist resolver', () => {
    describe('tracks', () => {
      it('should return playlist tracks with full data', async () => {
        const ctx = createMockContext({
          data: {
            items: [
              {
                track: {
                  ...BASE_TRACK_API,
                  album: BASE_ALBUM_API,
                  artists: [BASE_ARTIST_API],
                },
              },
            ],
            next: null,
            previous: null,
            total: 1,
          },
        });
        const parent = EXPECTED_PLAYLIST;
        const tracksResolver = resolvers.Playlist?.tracks;
        if (typeof tracksResolver === 'function') {
          const result = await tracksResolver(parent, {}, ctx, {} as any);
          expect(result.edges[0].node).toEqual(EXPECTED_TRACK);
        }
      });

      it('should handle custom pagination', async () => {
        const ctx = createMockContext({
          data: {
            items: [],
            next: null,
            previous: null,
            total: 0,
          },
        });
        const parent = EXPECTED_PLAYLIST;
        const args = { limit: 10, offset: 20 };
        const tracksResolver = resolvers.Playlist?.tracks;
        if (typeof tracksResolver === 'function') {
          await tracksResolver(parent, args, ctx, {} as any);
          expect(ctx.spotify.get).toHaveBeenCalledWith(
            `/playlists/${BASE_PLAYLIST_API.id}/tracks`,
            { params: { limit: 10, offset: 20 } }
          );
        }
      });

      it('should handle tracks with null preview URL', async () => {
        const ctx = createMockContext({
          data: {
            items: [
              {
                track: {
                  ...BASE_TRACK_API,
                  preview_url: null,
                  album: BASE_ALBUM_API,
                  artists: [BASE_ARTIST_API],
                },
              },
            ],
            next: null,
            previous: null,
            total: 1,
          },
        });
        const parent = EXPECTED_PLAYLIST;
        const tracksResolver = resolvers.Playlist?.tracks;
        if (typeof tracksResolver === 'function') {
          const result = await tracksResolver(parent, {}, ctx, {} as any);
          expect(result.edges[0].node.previewUrl).toBeNull();
        }
      });
    });
  });

  describe('Mutation resolvers', () => {
    describe('createPlaylist', () => {
      it('should create playlist with all fields', async () => {
        const ctx = {
          token: 'mock-token',
          spotify: {
            get: vi.fn().mockResolvedValue({ data: { id: BASE_USER_API.id } }),
            post: vi.fn().mockResolvedValue({ data: BASE_PLAYLIST_API }),
          },
        } as any;
        const args = {
          name: BASE_PLAYLIST_API.name,
          description: BASE_PLAYLIST_API.description,
          public: BASE_PLAYLIST_API.public,
        };
        const createPlaylistResolver = resolvers.Mutation?.createPlaylist;
        if (typeof createPlaylistResolver === 'function') {
          const result = await createPlaylistResolver({}, args, ctx, {} as any);
          expect(result).toEqual(EXPECTED_PLAYLIST);
          expect(ctx.spotify.post).toHaveBeenCalledWith(
            `/users/${BASE_USER_API.id}/playlists`,
            args
          );
        }
      });

      it('should create playlist with default public value', async () => {
        const ctx = {
          token: 'mock-token',
          spotify: {
            get: vi.fn().mockResolvedValue({ data: { id: BASE_USER_API.id } }),
            post: vi.fn().mockResolvedValue({ data: BASE_PLAYLIST_API }),
          },
        } as any;
        const args = {
          name: BASE_PLAYLIST_API.name,
          description: BASE_PLAYLIST_API.description,
        };
        const createPlaylistResolver = resolvers.Mutation?.createPlaylist;
        if (typeof createPlaylistResolver === 'function') {
          await createPlaylistResolver({}, args, ctx, {} as any);
          expect(ctx.spotify.post).toHaveBeenCalledWith(
            `/users/${BASE_USER_API.id}/playlists`,
            { ...args, public: false }
          );
        }
      });

      it('should handle playlist creation with null values', async () => {
        const playlistWithNulls = {
          ...BASE_PLAYLIST_API,
          description: null,
          public: null,
          images: null,
          owner: {
            ...BASE_USER_API,
            images: null,
          },
        };
        const ctx = {
          token: 'mock-token',
          spotify: {
            get: vi.fn().mockResolvedValue({ data: { id: BASE_USER_API.id } }),
            post: vi.fn().mockResolvedValue({ data: playlistWithNulls }),
          },
        } as any;
        const args = {
          name: BASE_PLAYLIST_API.name,
          description: null,
          public: null,
        };
        const createPlaylistResolver = resolvers.Mutation?.createPlaylist;
        if (typeof createPlaylistResolver === 'function') {
          const result = await createPlaylistResolver({}, args, ctx, {} as any);
          expect(result.description).toBeNull();
          expect(result.public).toBeNull();
          expect(result.images).toEqual([]);
          expect(result.owner.images).toEqual([]);
        }
      });
    });
  });

  describe('Edge cases and null handling', () => {
    it('should handle artists with null values', async () => {
      const artistWithNulls = {
        ...BASE_ARTIST_API,
        genres: null,
        popularity: null,
        images: null,
      };
      const ctx = createMockContext({
        data: {
          items: [artistWithNulls],
          next: null,
          previous: null,
          total: 1,
        },
      });
      const myTopArtistsResolver = resolvers.Query?.myTopArtists;
      if (typeof myTopArtistsResolver === 'function') {
        const result = await myTopArtistsResolver({}, {}, ctx, {} as any);
        const artist = result.edges[0].node;
        expect(artist.genres).toEqual([]);
        expect(artist.popularity).toBeNull();
        expect(artist.images).toEqual([]);
      }
    });

    it('should handle albums with null values', async () => {
      const albumWithNulls = {
        ...BASE_ALBUM_API,
        release_date: null,
        total_tracks: null,
        images: null,
      };
      const ctx = createMockContext({
        data: {
          items: [albumWithNulls],
          next: null,
          previous: null,
          total: 1,
        },
      });
      const artistAlbumsResolver = resolvers.Query?.artistAlbums;
      if (typeof artistAlbumsResolver === 'function') {
        const result = await artistAlbumsResolver(
          {},
          { artistId: BASE_ARTIST_API.id },
          ctx,
          {} as any
        );
        const album = result.edges[0].node;
        expect(album.releaseDate).toBeNull();
        expect(album.totalTracks).toBeNull();
        expect(album.images).toEqual([]);
      }
    });

    it('should handle playlists with null values', async () => {
      const playlistWithNulls = {
        ...BASE_PLAYLIST_API,
        description: null,
        public: null,
        images: null,
      };
      const ctx = createMockContext({
        data: {
          items: [playlistWithNulls],
          next: null,
          previous: null,
          total: 1,
        },
      });
      const myPlaylistsResolver = resolvers.Query?.myPlaylists;
      if (typeof myPlaylistsResolver === 'function') {
        const result = await myPlaylistsResolver({}, {}, ctx, {} as any);
        const playlist = result.edges[0].node;
        expect(playlist.description).toBeNull();
        expect(playlist.public).toBeNull();
        expect(playlist.images).toEqual([]);
      }
    });

    it('should handle album tracks with null release date and total tracks', async () => {
      const albumWithNulls = {
        ...BASE_ALBUM_API,
        release_date: null,
        total_tracks: null,
        images: null,
      };
      const ctx = createMockContext({
        data: {
          items: [
            {
              track: {
                ...BASE_TRACK_API,
                album: albumWithNulls,
                artists: [BASE_ARTIST_API],
              },
            },
          ],
          next: null,
          previous: null,
          total: 1,
        },
      });
      const parent = EXPECTED_PLAYLIST;
      const tracksResolver = resolvers.Playlist?.tracks;
      if (typeof tracksResolver === 'function') {
        const result = await tracksResolver(parent, {}, ctx, {} as any);
        const track = result.edges[0].node;
        expect(track.album.releaseDate).toBeNull();
        expect(track.album.totalTracks).toBeNull();
        expect(track.album.images).toEqual([]);
      }
    });
  });
});