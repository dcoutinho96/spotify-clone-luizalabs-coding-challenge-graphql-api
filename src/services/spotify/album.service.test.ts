import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAlbumById, getAlbumTracks } from "./album.service";
import type { GraphQLContext } from "#context";
import type { SpotifyAlbum, SpotifyPaginatedResponse, SpotifyTrack } from "#types/spotify";

// Mock dependencies
vi.mock("#utils/fetch", () => ({
  fetchSafeResource: vi.fn(),
}));

vi.mock("#utils/pagination", () => ({
  getPaginatedData: vi.fn(),
}));

import { fetchSafeResource } from "#utils/fetch";
import { getPaginatedData } from "#utils/pagination";

// Mock GraphQLContext
const mockContext: GraphQLContext = {
  token: "test-token",
  spotify: {} as any,
  isIntrospection: false,
  isAuthenticated: true,
};

describe("album service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAlbumById", () => {
    it("successfully fetches album by ID", async () => {
      const mockAlbum: SpotifyAlbum = {
        id: "album123",
        name: "Test Album",
        release_date: "2023-01-01",
        total_tracks: 12,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockAlbum);

      const result = await getAlbumById(mockContext, "album123");

      expect(result).toEqual(mockAlbum);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/albums/album123");
    });

    it("returns null when album not found", async () => {
      (fetchSafeResource as any).mockResolvedValue(null);

      const result = await getAlbumById(mockContext, "nonexistent");

      expect(result).toBeNull();
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/albums/nonexistent");
    });

    it("handles different album IDs", async () => {
      const mockAlbum: SpotifyAlbum = {
        id: "album456",
        name: "Another Album",
        release_date: "2023-06-01",
        total_tracks: 10,
        images: [{ url: "https://example.com/another.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockAlbum);

      const result = await getAlbumById(mockContext, "album456");

      expect(result).toEqual(mockAlbum);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/albums/album456");
    });

    it("handles album with null values", async () => {
      const mockAlbum: SpotifyAlbum = {
        id: "album789",
        name: "Null Album",
        release_date: null,
        total_tracks: null,
        images: null,
      };

      (fetchSafeResource as any).mockResolvedValue(mockAlbum);

      const result = await getAlbumById(mockContext, "album789");

      expect(result).toEqual(mockAlbum);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/albums/album789");
    });
  });

  describe("getAlbumTracks", () => {
    it("successfully fetches album tracks with limit and offset", async () => {
      const mockTracks: SpotifyPaginatedResponse<SpotifyTrack> = {
        items: [
          {
            id: "track1",
            name: "Track 1",
            duration_ms: 180000,
            preview_url: "https://example.com/preview1.mp3",
            album: {
              id: "album123",
              name: "Test Album",
              release_date: "2023-01-01",
              total_tracks: 12,
              images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
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
          {
            id: "track2",
            name: "Track 2",
            duration_ms: 200000,
            preview_url: null,
            album: {
              id: "album123",
              name: "Test Album",
              release_date: "2023-01-01",
              total_tracks: 12,
              images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
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
        ],
        total: 2,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockTracks);

      const result = await getAlbumTracks(mockContext, "album123", 10, 5);

      expect(result).toEqual(mockTracks);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/albums/album123/tracks", 10, 5);
    });

    it("successfully fetches album tracks with default limit and offset", async () => {
      const mockTracks: SpotifyPaginatedResponse<SpotifyTrack> = {
        items: [
          {
            id: "track1",
            name: "Track 1",
            duration_ms: 180000,
            preview_url: "https://example.com/preview1.mp3",
            album: {
              id: "album123",
              name: "Test Album",
              release_date: "2023-01-01",
              total_tracks: 12,
              images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
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
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockTracks);

      const result = await getAlbumTracks(mockContext, "album123");

      expect(result).toEqual(mockTracks);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/albums/album123/tracks", undefined, undefined);
    });

    it("handles empty tracks response", async () => {
      const mockTracks: SpotifyPaginatedResponse<SpotifyTrack> = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockTracks);

      const result = await getAlbumTracks(mockContext, "album123", 20, 0);

      expect(result).toEqual(mockTracks);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/albums/album123/tracks", 20, 0);
    });

    it("handles different album IDs for tracks", async () => {
      const mockTracks: SpotifyPaginatedResponse<SpotifyTrack> = {
        items: [
          {
            id: "track3",
            name: "Track 3",
            duration_ms: 150000,
            preview_url: "https://example.com/preview3.mp3",
            album: {
              id: "album456",
              name: "Another Album",
              release_date: "2023-06-01",
              total_tracks: 10,
              images: [{ url: "https://example.com/another.jpg", height: 300, width: 300 }],
            },
            artists: [
              {
                id: "artist2",
                name: "Artist 2",
                genres: ["jazz"],
                popularity: 70,
                images: [{ url: "https://example.com/artist2.jpg", height: 300, width: 300 }],
              },
            ],
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockTracks);

      const result = await getAlbumTracks(mockContext, "album456", 5, 0);

      expect(result).toEqual(mockTracks);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/albums/album456/tracks", 5, 0);
    });
  });
});
