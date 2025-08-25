import { describe, it, expect, vi, beforeEach } from "vitest";
import { userQueryResolvers } from "./user.resolver";
import type { GraphQLContext } from "#context";
import { GraphQLError } from "graphql";

// Mock dependencies
vi.mock("#services/spotify/user.service", () => ({
  getMe: vi.fn(),
  getMyTopArtists: vi.fn(),
}));

vi.mock("#mappers/user.mapper", () => ({
  transformUser: vi.fn(),
}));

vi.mock("#mappers/artist.mapper", () => ({
  transformArtist: vi.fn(),
}));

vi.mock("#utils/pagination", () => ({
  createConnection: vi.fn(),
}));

import { getMe, getMyTopArtists } from "#services/spotify/user.service";
import { transformUser } from "#mappers/user.mapper";
import { transformArtist } from "#mappers/artist.mapper";
import { createConnection } from "#utils/pagination";

// Mock GraphQLContext
const mockContext: GraphQLContext = {
  token: "test-token",
  spotify: {} as any,
  isIntrospection: false,
  isAuthenticated: true,
};

describe("user resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("me", () => {
    it("successfully returns transformed user when authenticated", async () => {
      const mockSpotifyUser = {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/image.jpg", height: 300, width: 300 }],
      };

      const mockTransformedUser = {
        id: "user123",
        displayName: "Test User",
        images: [{ url: "https://example.com/image.jpg", height: 300, width: 300 }],
      };

      (getMe as any).mockResolvedValue(mockSpotifyUser);
      (transformUser as any).mockReturnValue(mockTransformedUser);

      const result = await (userQueryResolvers.me as any)(null, {}, mockContext);

      expect(result).toEqual(mockTransformedUser);
      expect(getMe).toHaveBeenCalledWith(mockContext);
      expect(transformUser).toHaveBeenCalledWith(mockSpotifyUser);
    });

    it("throws UNAUTHORIZED_SPOTIFY error when token is missing", async () => {
      const contextWithoutToken: GraphQLContext = {
        ...mockContext,
        token: null,
        isAuthenticated: false,
      };

      await expect((userQueryResolvers.me as any)(null, {}, contextWithoutToken)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMe).not.toHaveBeenCalled();
      expect(transformUser).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error when not authenticated", async () => {
      const contextNotAuthenticated: GraphQLContext = {
        ...mockContext,
        isAuthenticated: false,
      };

      await expect((userQueryResolvers.me as any)(null, {}, contextNotAuthenticated)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMe).not.toHaveBeenCalled();
      expect(transformUser).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error when token is empty string", async () => {
      const contextEmptyToken: GraphQLContext = {
        ...mockContext,
        token: "",
        isAuthenticated: false,
      };

      await expect((userQueryResolvers.me as any)(null, {}, contextEmptyToken)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMe).not.toHaveBeenCalled();
      expect(transformUser).not.toHaveBeenCalled();
    });

    it("throws SPOTIFY_API_ERROR when user is null", async () => {
      (getMe as any).mockResolvedValue(null);

      await expect((userQueryResolvers.me as any)(null, {}, mockContext)).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );

      expect(getMe).toHaveBeenCalledWith(mockContext);
      expect(transformUser).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error when getMe throws UNAUTHORIZED_SPOTIFY", async () => {
      const unauthorizedError = new Error("UNAUTHORIZED_SPOTIFY");
      (getMe as any).mockRejectedValue(unauthorizedError);

      await expect((userQueryResolvers.me as any)(null, {}, mockContext)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMe).toHaveBeenCalledWith(mockContext);
      expect(transformUser).not.toHaveBeenCalled();
    });

    it("throws SPOTIFY_API_ERROR for other errors from getMe", async () => {
      const otherError = new Error("Network error");
      (getMe as any).mockRejectedValue(otherError);

      await expect((userQueryResolvers.me as any)(null, {}, mockContext)).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );

      expect(getMe).toHaveBeenCalledWith(mockContext);
      expect(transformUser).not.toHaveBeenCalled();
    });
  });

  describe("myTopArtists", () => {
    it("successfully returns transformed artists when authenticated", async () => {
      const mockSpotifyArtists = {
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

      const mockTransformedArtists = {
        id: "artist1",
        name: "Artist 1",
        genres: ["rock"],
        popularity: 80,
        images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
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

      const mockConnection = {
        edges: [{ cursor: "0", node: mockTransformedArtists }],
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: "0", endCursor: "0" },
        totalCount: 1,
      };

      (getMyTopArtists as any).mockResolvedValue(mockSpotifyArtists);
      (transformArtist as any).mockReturnValue(mockTransformedArtists);
      (createConnection as any).mockReturnValue(mockConnection);

      const result = await (userQueryResolvers.myTopArtists as any)(null, { limit: 10, offset: 0 }, mockContext);

      expect(result).toEqual(mockConnection);
      expect(getMyTopArtists).toHaveBeenCalledWith(mockContext, 10, 0);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyArtists, 0, transformArtist);
    });

    it("successfully returns transformed artists with default limit and offset", async () => {
      const mockSpotifyArtists = {
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

      const mockTransformedArtists = {
        id: "artist1",
        name: "Artist 1",
        genres: ["rock"],
        popularity: 80,
        images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
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

      const mockConnection = {
        edges: [{ cursor: "0", node: mockTransformedArtists }],
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: "0", endCursor: "0" },
        totalCount: 1,
      };

      (getMyTopArtists as any).mockResolvedValue(mockSpotifyArtists);
      (transformArtist as any).mockReturnValue(mockTransformedArtists);
      (createConnection as any).mockReturnValue(mockConnection);

      const result = await (userQueryResolvers.myTopArtists as any)(null, {}, mockContext);

      expect(result).toEqual(mockConnection);
      expect(getMyTopArtists).toHaveBeenCalledWith(mockContext, undefined, undefined);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyArtists, 0, transformArtist);
    });

    it("throws UNAUTHORIZED_SPOTIFY error when token is missing", async () => {
      const contextWithoutToken: GraphQLContext = {
        ...mockContext,
        token: null,
        isAuthenticated: false,
      };

      await expect((userQueryResolvers.myTopArtists as any)(null, {}, contextWithoutToken)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMyTopArtists).not.toHaveBeenCalled();
      expect(transformArtist).not.toHaveBeenCalled();
      expect(createConnection).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error when not authenticated", async () => {
      const contextNotAuthenticated: GraphQLContext = {
        ...mockContext,
        isAuthenticated: false,
      };

      await expect((userQueryResolvers.myTopArtists as any)(null, {}, contextNotAuthenticated)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token missing", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMyTopArtists).not.toHaveBeenCalled();
      expect(transformArtist).not.toHaveBeenCalled();
      expect(createConnection).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED_SPOTIFY error when getMyTopArtists throws UNAUTHORIZED_SPOTIFY", async () => {
      const unauthorizedError = new Error("UNAUTHORIZED_SPOTIFY");
      (getMyTopArtists as any).mockRejectedValue(unauthorizedError);

      await expect((userQueryResolvers.myTopArtists as any)(null, { limit: 10, offset: 0 }, mockContext)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );

      expect(getMyTopArtists).toHaveBeenCalledWith(mockContext, 10, 0);
      expect(transformArtist).not.toHaveBeenCalled();
      expect(createConnection).not.toHaveBeenCalled();
    });

    it("throws SPOTIFY_API_ERROR for other errors from getMyTopArtists", async () => {
      const otherError = new Error("Network error");
      (getMyTopArtists as any).mockRejectedValue(otherError);

      await expect((userQueryResolvers.myTopArtists as any)(null, { limit: 10, offset: 0 }, mockContext)).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );

      expect(getMyTopArtists).toHaveBeenCalledWith(mockContext, 10, 0);
      expect(transformArtist).not.toHaveBeenCalled();
      expect(createConnection).not.toHaveBeenCalled();
    });
  });
});
