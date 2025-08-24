import { describe, it, expect, vi, beforeEach } from "vitest";
import { getArtistById, getArtistAlbums } from "./artist.service";
import type { GraphQLContext } from "#context";
import type { SpotifyArtist, SpotifyPaginatedResponse, SpotifyAlbum } from "#types/spotify";

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

describe("artist service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getArtistById", () => {
    it("successfully fetches artist by ID", async () => {
      const mockArtist: SpotifyArtist = {
        id: "artist123",
        name: "Test Artist",
        genres: ["rock", "pop"],
        popularity: 85,
        images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockArtist);

      const result = await getArtistById(mockContext, "artist123");

      expect(result).toEqual(mockArtist);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/artists/artist123");
    });

    it("returns null when artist not found", async () => {
      (fetchSafeResource as any).mockResolvedValue(null);

      const result = await getArtistById(mockContext, "nonexistent");

      expect(result).toBeNull();
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/artists/nonexistent");
    });

    it("handles different artist IDs", async () => {
      const mockArtist: SpotifyArtist = {
        id: "artist456",
        name: "Another Artist",
        genres: ["jazz"],
        popularity: 70,
        images: [{ url: "https://example.com/another.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockArtist);

      const result = await getArtistById(mockContext, "artist456");

      expect(result).toEqual(mockArtist);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/artists/artist456");
    });
  });

  describe("getArtistAlbums", () => {
    it("successfully fetches artist albums with limit and offset", async () => {
      const mockAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
        items: [
          {
            id: "album1",
            name: "Album 1",
            release_date: "2023-01-01",
            total_tracks: 12,
            images: [{ url: "https://example.com/album1.jpg", height: 300, width: 300 }],
          },
          {
            id: "album2",
            name: "Album 2",
            release_date: "2023-06-01",
            total_tracks: 10,
            images: [{ url: "https://example.com/album2.jpg", height: 300, width: 300 }],
          },
        ],
        total: 2,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockAlbums);

      const result = await getArtistAlbums(mockContext, "artist123", 10, 5);

      expect(result).toEqual(mockAlbums);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/artists/artist123/albums", 10, 5);
    });

    it("successfully fetches artist albums with default limit and offset", async () => {
      const mockAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
        items: [
          {
            id: "album1",
            name: "Album 1",
            release_date: "2023-01-01",
            total_tracks: 12,
            images: [{ url: "https://example.com/album1.jpg", height: 300, width: 300 }],
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockAlbums);

      const result = await getArtistAlbums(mockContext, "artist123");

      expect(result).toEqual(mockAlbums);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/artists/artist123/albums", undefined, undefined);
    });

    it("handles empty albums response", async () => {
      const mockAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockAlbums);

      const result = await getArtistAlbums(mockContext, "artist123", 20, 0);

      expect(result).toEqual(mockAlbums);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/artists/artist123/albums", 20, 0);
    });

    it("handles different artist IDs for albums", async () => {
      const mockAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
        items: [
          {
            id: "album3",
            name: "Album 3",
            release_date: "2022-01-01",
            total_tracks: 8,
            images: [{ url: "https://example.com/album3.jpg", height: 300, width: 300 }],
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockAlbums);

      const result = await getArtistAlbums(mockContext, "artist456", 5, 0);

      expect(result).toEqual(mockAlbums);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/artists/artist456/albums", 5, 0);
    });
  });
});
