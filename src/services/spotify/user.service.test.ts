import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMe, getMyTopArtists } from "./user.service";
import type { GraphQLContext } from "#context";
import type { SpotifyUser, SpotifyPaginatedResponse, SpotifyArtist } from "#types/spotify";

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

describe("user service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMe", () => {
    it("successfully fetches user data", async () => {
      const mockUser: SpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/image.jpg", height: 300, width: 300 }],
      };

      (fetchSafeResource as any).mockResolvedValue(mockUser);

      const result = await getMe(mockContext);

      expect(result).toEqual(mockUser);
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
    });

    it("returns null when user not found", async () => {
      (fetchSafeResource as any).mockResolvedValue(null);

      const result = await getMe(mockContext);

      expect(result).toBeNull();
      expect(fetchSafeResource).toHaveBeenCalledWith(mockContext, "/me");
    });
  });

  describe("getMyTopArtists", () => {
    it("successfully fetches top artists with limit and offset", async () => {
      const mockArtists: SpotifyPaginatedResponse<SpotifyArtist> = {
        items: [
          {
            id: "artist1",
            name: "Artist 1",
            genres: ["rock", "pop"],
            popularity: 85,
            images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
          },
          {
            id: "artist2",
            name: "Artist 2",
            genres: ["jazz"],
            popularity: 70,
            images: [{ url: "https://example.com/artist2.jpg", height: 300, width: 300 }],
          },
        ],
        total: 2,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockArtists);

      const result = await getMyTopArtists(mockContext, 10, 5);

      expect(result).toEqual(mockArtists);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/me/top/artists", 10, 5);
    });

    it("successfully fetches top artists with default limit and offset", async () => {
      const mockArtists: SpotifyPaginatedResponse<SpotifyArtist> = {
        items: [
          {
            id: "artist1",
            name: "Artist 1",
            genres: ["rock"],
            popularity: 80,
            images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
          },
        ],
        total: 1,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockArtists);

      const result = await getMyTopArtists(mockContext);

      expect(result).toEqual(mockArtists);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/me/top/artists", undefined, undefined);
    });

    it("handles empty artists response", async () => {
      const mockArtists: SpotifyPaginatedResponse<SpotifyArtist> = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      (getPaginatedData as any).mockResolvedValue(mockArtists);

      const result = await getMyTopArtists(mockContext, 20, 0);

      expect(result).toEqual(mockArtists);
      expect(getPaginatedData).toHaveBeenCalledWith(mockContext, "/me/top/artists", 20, 0);
    });
  });
});
