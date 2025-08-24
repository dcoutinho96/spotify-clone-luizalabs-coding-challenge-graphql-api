import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMyPlaylists, getPlaylistById, getPlaylistTracks, createPlaylist } from "./playlist.service";
import type { GraphQLContext } from "#context";
import type { SpotifyPlaylist, SpotifyUser } from "#types/spotify";

// Mock dependencies
vi.mock("#utils/fetch", () => ({
  fetchSafeResource: vi.fn(),
}));

import { fetchSafeResource } from "#utils/fetch";

// Mock GraphQLContext
const mockContext: GraphQLContext = {
  token: "test-token",
  spotify: {
    post: vi.fn(),
  } as any,
  isIntrospection: false,
  isAuthenticated: true,
};

describe("playlist service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyPlaylists", () => {
    it("successfully fetches playlists with limit and offset", async () => {
      const mockPlaylists = {
        items: [
          {
            id: "playlist1",
            name: "Playlist 1",
            description: "Test playlist 1",
            public: true,
            images: [{ url: "https://example.com/playlist1.jpg", height: 300, width: 300 }],
            owner: {
              id: "user1",
              display_name: "User 1",
              images: [{ url: "https://example.com/user1.jpg", height: 300, width: 300 }],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockPlaylists);

      const result = await getMyPlaylists(mockContext, 10, 5);

      expect(result).toEqual(mockPlaylists);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me/playlists?limit=10&offset=5");
    });

    it("successfully fetches playlists with default limit and offset", async () => {
      const mockPlaylists = {
        items: [
          {
            id: "playlist1",
            name: "Playlist 1",
            description: "Test playlist 1",
            public: true,
            images: [{ url: "https://example.com/playlist1.jpg", height: 300, width: 300 }],
            owner: {
              id: "user1",
              display_name: "User 1",
              images: [{ url: "https://example.com/user1.jpg", height: 300, width: 300 }],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockPlaylists);

      const result = await getMyPlaylists(mockContext);

      expect(result).toEqual(mockPlaylists);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me/playlists?limit=20&offset=0");
    });

    it("handles empty playlists response", async () => {
      const mockPlaylists = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockPlaylists);

      const result = await getMyPlaylists(mockContext, 20, 0);

      expect(result).toEqual(mockPlaylists);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me/playlists?limit=20&offset=0");
    });
  });

  describe("getPlaylistById", () => {
    it("successfully fetches playlist by ID", async () => {
      const mockPlaylist: SpotifyPlaylist = {
        id: "playlist123",
        name: "Test Playlist",
        description: "A test playlist",
        public: true,
        images: [{ url: "https://example.com/playlist.jpg", height: 300, width: 300 }],
        owner: {
          id: "user123",
          display_name: "Test User",
          images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
        },
      };

      (fetchSafeResource as any).mockResolvedValue(mockPlaylist);

      const result = await getPlaylistById(mockContext, "playlist123");

      expect(result).toEqual(mockPlaylist);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/playlists/playlist123");
    });

    it("returns null when playlist not found", async () => {
      (fetchSafeResource as any).mockResolvedValue(null);

      const result = await getPlaylistById(mockContext, "nonexistent");

      expect(result).toBeNull();
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/playlists/nonexistent");
    });
  });

  describe("getPlaylistTracks", () => {
    it("successfully fetches playlist tracks with limit and offset", async () => {
      const mockTracks = {
        items: [
          {
            track: {
              id: "track1",
              name: "Track 1",
              duration_ms: 180000,
              preview_url: "https://example.com/preview1.mp3",
              album: {
                id: "album1",
                name: "Album 1",
                release_date: "2023-01-01",
                total_tracks: 12,
                images: [{ url: "https://example.com/album1.jpg", height: 300, width: 300 }],
              },
              artists: [
                {
                  id: "artist1",
                  name: "Artist 1",
                  genres: ["rock"],
                  popularity: 80,
                  images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
                },
              ],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockTracks);

      const result = await getPlaylistTracks(mockContext, "playlist123", 10, 5);

      expect(result).toEqual(mockTracks);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/playlists/playlist123/tracks?limit=10&offset=5");
    });

    it("successfully fetches playlist tracks with default limit and offset", async () => {
      const mockTracks = {
        items: [
          {
            track: {
              id: "track1",
              name: "Track 1",
              duration_ms: 180000,
              preview_url: "https://example.com/preview1.mp3",
              album: {
                id: "album1",
                name: "Album 1",
                release_date: "2023-01-01",
                total_tracks: 12,
                images: [{ url: "https://example.com/album1.jpg", height: 300, width: 300 }],
              },
              artists: [
                {
                  id: "artist1",
                  name: "Artist 1",
                  genres: ["rock"],
                  popularity: 80,
                  images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
                },
              ],
            },
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockTracks);

      const result = await getPlaylistTracks(mockContext, "playlist123");

      expect(result).toEqual(mockTracks);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/playlists/playlist123/tracks?limit=20&offset=0");
    });
  });

  describe("createPlaylist", () => {
    it("successfully creates playlist with all arguments", async () => {
      const mockUser: SpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      };

      const mockPlaylist: SpotifyPlaylist = {
        id: "playlist123",
        name: "New Playlist",
        description: "A new test playlist",
        public: false,
        images: [{ url: "https://example.com/playlist.jpg", height: 300, width: 300 }],
        owner: {
          id: "user123",
          display_name: "Test User",
          images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
        },
      };

      (fetchSafeResource as any).mockResolvedValue(mockUser);
      mockContext.spotify.post = vi.fn().mockResolvedValue({ data: mockPlaylist });

      const result = await createPlaylist(mockContext, {
        name: "New Playlist",
        description: "A new test playlist",
        public: false,
      });

      expect(result).toEqual(mockPlaylist);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
      expect(mockContext.spotify.post).toHaveBeenCalledWith("/users/user123/playlists", {
        name: "New Playlist",
        description: "A new test playlist",
        public: false,
      });
    });

    it("successfully creates playlist with default values", async () => {
      const mockUser: SpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      };

      const mockPlaylist: SpotifyPlaylist = {
        id: "playlist123",
        name: "New Playlist",
        description: "",
        public: false,
        images: [{ url: "https://example.com/playlist.jpg", height: 300, width: 300 }],
        owner: {
          id: "user123",
          display_name: "Test User",
          images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
        },
      };

      (fetchSafeResource as any).mockResolvedValue(mockUser);
      mockContext.spotify.post = vi.fn().mockResolvedValue({ data: mockPlaylist });

      const result = await createPlaylist(mockContext, {
        name: "New Playlist",
        description: null,
        public: null,
      });

      expect(result).toEqual(mockPlaylist);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
      expect(mockContext.spotify.post).toHaveBeenCalledWith("/users/user123/playlists", {
        name: "New Playlist",
        description: "",
        public: false,
      });
    });

    it("throws UNAUTHORIZED_SPOTIFY error when user fetch fails", async () => {
      (fetchSafeResource as any).mockResolvedValue(null);

      await expect(createPlaylist(mockContext, {
        name: "New Playlist",
        description: "Test",
        public: true,
      })).rejects.toThrow("UNAUTHORIZED_SPOTIFY");

      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
      expect(mockContext.spotify.post).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error on 401 response from create", async () => {
      const mockUser: SpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockUser);
      mockContext.spotify.post = vi.fn().mockRejectedValue({
        response: { status: 401 },
      });

      await expect(createPlaylist(mockContext, {
        name: "New Playlist",
        description: "Test",
        public: true,
      })).rejects.toThrow("UNAUTHORIZED_SPOTIFY");

      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
      expect(mockContext.spotify.post).toHaveBeenCalledWith("/users/user123/playlists", {
        name: "New Playlist",
        description: "Test",
        public: true,
      });
    });

    it("re-throws non-401 errors from create", async () => {
      const mockUser: SpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      };

      const networkError = new Error("Network error");
      (fetchSafeResource as any).mockResolvedValue(mockUser);
      mockContext.spotify.post = vi.fn().mockRejectedValue(networkError);

      await expect(createPlaylist(mockContext, {
        name: "New Playlist",
        description: "Test",
        public: true,
      })).rejects.toThrow("Network error");

      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
      expect(mockContext.spotify.post).toHaveBeenCalledWith("/users/user123/playlists", {
        name: "New Playlist",
        description: "Test",
        public: true,
      });
    });
  });
});
