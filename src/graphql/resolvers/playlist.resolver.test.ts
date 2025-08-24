import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { GraphQLError } from "graphql";
import { playlistQueryResolvers, playlistMutationResolvers, playlistFieldResolvers } from "./playlist.resolver";
import type { GraphQLContext } from "#context";
import type { SpotifyPlaylist, SpotifyPaginatedResponse, SpotifyTrack } from "#types/spotify";

// Mock dependencies
vi.mock("#services/spotify/playlist.service", () => ({
  getMyPlaylists: vi.fn(),
  getPlaylistById: vi.fn(),
  getPlaylistTracks: vi.fn(),
  createPlaylist: vi.fn(),
}));

vi.mock("#mappers/playlist.mapper", () => ({
  transformPlaylist: vi.fn(),
}));

vi.mock("#mappers/track.mapper", () => ({
  transformTrack: vi.fn(),
}));

vi.mock("#utils/pagination", () => ({
  createConnection: vi.fn(),
}));

import {
  getMyPlaylists,
  getPlaylistById,
  getPlaylistTracks,
  createPlaylist,
} from "#services/spotify/playlist.service";
import { transformPlaylist } from "#mappers/playlist.mapper";
import { transformTrack } from "#mappers/track.mapper";
import { createConnection } from "#utils/pagination";

describe("playlistQueryResolvers", () => {
  const mockContext: GraphQLContext = {
    token: "test-token",
    spotify: {} as any,
    isIntrospection: false,
    isAuthenticated: true,
  };

  const mockSpotifyPlaylists: SpotifyPaginatedResponse<SpotifyPlaylist> = {
    items: [
      {
        id: "playlist1",
        name: "Playlist 1",
        description: "Test playlist",
        public: true,
        images: [],
        owner: { id: "user1", display_name: "User 1", images: [] },
      },
      {
        id: "playlist2",
        name: "Playlist 2",
        description: "Another playlist",
        public: false,
        images: [],
        owner: { id: "user1", display_name: "User 1", images: [] },
      },
    ],
    total: 2,
    next: null,
    previous: null,
  };

  const mockTransformedPlaylist = {
    id: "playlist1",
    name: "Playlist 1",
    description: "Test playlist",
    public: true,
    images: [],
    owner: { id: "user1", displayName: "User 1", images: [] },
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("myPlaylists", () => {
    it("successfully fetches and transforms playlists", async () => {
      (getMyPlaylists as Mock).mockResolvedValue(mockSpotifyPlaylists);
      (createConnection as Mock).mockReturnValue({
        edges: [],
        pageInfo: {},
        totalCount: 2,
      });

      const result = await (playlistQueryResolvers.myPlaylists as any)(
        null,
        { limit: 10, offset: 0 },
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 2 });
      expect(getMyPlaylists).toHaveBeenCalledWith(mockContext, 10, 0);
      expect(createConnection).toHaveBeenCalledWith(
        mockSpotifyPlaylists,
        0,
        transformPlaylist
      );
    });

    it("returns empty connection when not authenticated", async () => {
      const unauthenticatedContext: GraphQLContext = {
        ...mockContext,
        isAuthenticated: false,
      };

      const result = await (playlistQueryResolvers.myPlaylists as any)(
        null,
        { limit: 10, offset: 0 },
        unauthenticatedContext
      );

      expect(result).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      });
      expect(getMyPlaylists).not.toHaveBeenCalled();
    });

    it("throws GraphQLError with 401 status for UNAUTHORIZED_SPOTIFY error", async () => {
      (getMyPlaylists as Mock).mockRejectedValue(new Error("UNAUTHORIZED_SPOTIFY"));

      await expect(
        (playlistQueryResolvers.myPlaylists as any)(
          null,
          { limit: 10, offset: 0 },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 status for other errors", async () => {
      (getMyPlaylists as Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        (playlistQueryResolvers.myPlaylists as any)(
          null,
          { limit: 10, offset: 0 },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });

  describe("playlistById", () => {
    it("successfully fetches and transforms playlist", async () => {
      (getPlaylistById as Mock).mockResolvedValue(mockSpotifyPlaylists.items[0]);
      (transformPlaylist as Mock).mockReturnValue(mockTransformedPlaylist);

      const result = await (playlistQueryResolvers.playlistById as any)(
        null,
        { id: "playlist1" },
        mockContext
      );

      expect(result).toEqual(mockTransformedPlaylist);
      expect(getPlaylistById).toHaveBeenCalledWith(mockContext, "playlist1");
      expect(transformPlaylist).toHaveBeenCalledWith(
        mockSpotifyPlaylists.items[0]
      );
    });

    it("returns null when playlist not found", async () => {
      (getPlaylistById as Mock).mockResolvedValue(null);

      const result = await (playlistQueryResolvers.playlistById as any)(
        null,
        { id: "nonexistent" },
        mockContext
      );

      expect(result).toBeNull();
      expect(getPlaylistById).toHaveBeenCalledWith(mockContext, "nonexistent");
      expect(transformPlaylist).not.toHaveBeenCalled();
    });

    it("throws GraphQLError with 401 status for UNAUTHORIZED_SPOTIFY error", async () => {
      (getPlaylistById as Mock).mockRejectedValue(new Error("UNAUTHORIZED_SPOTIFY"));

      await expect(
        (playlistQueryResolvers.playlistById as any)(
          null,
          { id: "playlist1" },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 status for other errors", async () => {
      (getPlaylistById as Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        (playlistQueryResolvers.playlistById as any)(
          null,
          { id: "playlist1" },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });
});

describe("playlistMutationResolvers", () => {
  const mockContext: GraphQLContext = {
    token: "test-token",
    spotify: {} as any,
    isIntrospection: false,
    isAuthenticated: true,
  };

  const mockCreatedPlaylist: SpotifyPlaylist = {
    id: "new-playlist",
    name: "New Playlist",
    description: "A new playlist",
    public: false,
    images: [],
    owner: { id: "user1", display_name: "User 1", images: [] },
  };

  const mockTransformedPlaylist = {
    id: "new-playlist",
    name: "New Playlist",
    description: "A new playlist",
    public: false,
    images: [],
    owner: { id: "user1", displayName: "User 1", images: [] },
    tracks: { edges: [], pageInfo: {}, totalCount: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPlaylist", () => {
    it("successfully creates playlist", async () => {
      (createPlaylist as Mock).mockResolvedValue(mockCreatedPlaylist);
      (transformPlaylist as Mock).mockReturnValue(mockTransformedPlaylist);

      const result = await (playlistMutationResolvers.createPlaylist as any)(
        null,
        { name: "New Playlist", description: "A new playlist", public: false },
        mockContext
      );

      expect(result).toEqual(mockTransformedPlaylist);
      expect(createPlaylist).toHaveBeenCalledWith(mockContext, {
        name: "New Playlist",
        description: "A new playlist",
        public: false,
      });
      expect(transformPlaylist).toHaveBeenCalledWith(mockCreatedPlaylist);
    });

    it("throws GraphQLError with 401 when not authenticated", async () => {
      const unauthenticatedContext: GraphQLContext = {
        ...mockContext,
        isAuthenticated: false,
      };

      await expect(
        (playlistMutationResolvers.createPlaylist as any)(
          null,
          { name: "New Playlist" },
          unauthenticatedContext
        )
      ).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 401 for UNAUTHORIZED_SPOTIFY error", async () => {
      (createPlaylist as Mock).mockRejectedValue(new Error("UNAUTHORIZED_SPOTIFY"));

      await expect(
        (playlistMutationResolvers.createPlaylist as any)(
          null,
          { name: "New Playlist" },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 for other errors", async () => {
      (createPlaylist as Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        (playlistMutationResolvers.createPlaylist as any)(
          null,
          { name: "New Playlist" },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });
});

describe("playlistFieldResolvers", () => {
  const mockContext: GraphQLContext = {
    token: "test-token",
    spotify: {} as any,
    isIntrospection: false,
    isAuthenticated: true,
  };

  const mockParent = { id: "playlist1" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tracks", () => {
    it("successfully fetches and transforms playlist tracks", async () => {
      const mockSpotifyTracks: SpotifyPaginatedResponse<{ track: SpotifyTrack }> = {
        items: [
          {
            track: {
              id: "track1",
              name: "Track 1",
              duration_ms: 180000,
              preview_url: null,
              album: {
                id: "album1",
                name: "Album 1",
                release_date: "2023-01-01",
                total_tracks: 12,
                images: [],
              },
              artists: [],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPlaylistTracks as Mock).mockResolvedValue(mockSpotifyTracks);
      (createConnection as Mock).mockReturnValue({
        edges: [],
        pageInfo: {},
        totalCount: 1,
      });

      const result = await (playlistFieldResolvers.tracks as any)(
        mockParent,
        { limit: 10, offset: 0 },
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 1 });
      expect(getPlaylistTracks).toHaveBeenCalledWith(
        mockContext,
        "playlist1",
        10,
        0
      );
      expect(createConnection).toHaveBeenCalledWith(
        mockSpotifyTracks,
        0,
        expect.any(Function)
      );
    });

    it("throws GraphQLError with 401 for UNAUTHORIZED_SPOTIFY", async () => {
      (getPlaylistTracks as Mock).mockRejectedValue(new Error("UNAUTHORIZED_SPOTIFY"));

      await expect(
        (playlistFieldResolvers.tracks as any)(
          mockParent,
          { limit: 10, offset: 0 },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 for other errors", async () => {
      (getPlaylistTracks as Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        (playlistFieldResolvers.tracks as any)(
          mockParent,
          { limit: 10, offset: 0 },
          mockContext
        )
      ).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });

    it("calls transformTrack correctly inside mapper", async () => {
      const mockSpotifyTracks: SpotifyPaginatedResponse<{ track: SpotifyTrack }> = {
        items: [
          {
            track: {
              id: "track1",
              name: "Track 1",
              duration_ms: 180000,
              preview_url: null,
              album: {
                id: "album1",
                name: "Album 1",
                release_date: "2023-01-01",
                total_tracks: 12,
                images: [],
              },
              artists: [],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPlaylistTracks as Mock).mockResolvedValue(mockSpotifyTracks);

      let mapperFn: ((item: { track: SpotifyTrack }) => any) | undefined;

      (createConnection as Mock).mockImplementation(
        (
          _data: SpotifyPaginatedResponse<{ track: SpotifyTrack }>,
          _offset: number,
          mapper: (item: { track: SpotifyTrack }) => any
        ) => {
          mapperFn = mapper;
          return { edges: [], pageInfo: {}, totalCount: 1 };
        }
      );

      (transformTrack as Mock).mockReturnValue({ id: "track1", name: "Track 1" });

      await (playlistFieldResolvers.tracks as any)(
        mockParent,
        { limit: 10, offset: 0 },
        mockContext
      );

      expect(mapperFn).toBeDefined();
      if (mapperFn) {
        const mapped = mapperFn(mockSpotifyTracks.items[0]!);
        expect(transformTrack).toHaveBeenCalledWith(
          mockSpotifyTracks.items[0]!.track
        );
        expect(mapped).toEqual({ id: "track1", name: "Track 1" });
      }
    });
  });
});
