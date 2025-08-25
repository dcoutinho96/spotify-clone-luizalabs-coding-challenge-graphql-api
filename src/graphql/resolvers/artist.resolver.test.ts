import { describe, it, expect, vi, beforeEach } from "vitest";
import { GraphQLError } from "graphql";
import { artistQueryResolvers, artistFieldResolvers } from "./artist.resolver";
import type { GraphQLContext } from "#context";
import type { SpotifyArtist, SpotifyPaginatedResponse, SpotifyAlbum } from "#types/spotify";

// Mock dependencies
vi.mock("#services/spotify/artist.service", () => ({
  getArtistById: vi.fn(),
  getArtistAlbums: vi.fn(),
}));

vi.mock("#mappers/artist.mapper", () => ({
  transformArtist: vi.fn(),
}));

vi.mock("#mappers/album.mapper", () => ({
  transformAlbum: vi.fn(),
}));

vi.mock("#utils/pagination", () => ({
  createConnection: vi.fn(),
}));

import { getArtistById, getArtistAlbums } from "#services/spotify/artist.service";
import { transformArtist } from "#mappers/artist.mapper";
import { transformAlbum } from "#mappers/album.mapper";
import { createConnection } from "#utils/pagination";

describe("artistQueryResolvers", () => {
  const mockContext: GraphQLContext = {
    token: "test-token",
    spotify: {} as any,
    isIntrospection: false,
    isAuthenticated: true,
  };

  const mockSpotifyArtist: SpotifyArtist = {
    id: "artist123",
    name: "Test Artist",
    genres: ["rock", "pop"],
    popularity: 85,
    images: [{ url: "image1.jpg", height: 300, width: 300 }],
  };

  const mockSpotifyAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
    items: [
      { id: "album1", name: "Album 1", release_date: "2023-01-01", total_tracks: 12, images: [] },
      { id: "album2", name: "Album 2", release_date: "2023-02-01", total_tracks: 10, images: [] },
    ],
    total: 2,
    next: null,
    previous: null,
  };

  const mockTransformedArtist = {
    id: "artist123",
    name: "Test Artist",
    genres: ["rock", "pop"],
    popularity: 85,
    images: [{ url: "image1.jpg", height: 300, width: 300 }],
    albums: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null }, totalCount: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("artistById", () => {
    it("successfully fetches and transforms artist", async () => {
      (getArtistById as any).mockResolvedValue(mockSpotifyArtist);
      (transformArtist as any).mockReturnValue(mockTransformedArtist);

      const result = await (artistQueryResolvers.artistById as any)(null, { id: "artist123" }, mockContext);

      expect(result).toEqual(mockTransformedArtist);
      expect(getArtistById).toHaveBeenCalledWith(mockContext, "artist123");
      expect(transformArtist).toHaveBeenCalledWith(mockSpotifyArtist);
    });

    it("throws GraphQLError with 404 status when artist not found (4xx)", async () => {
      (getArtistById as any).mockRejectedValue(new Error("NOT_FOUND_SPOTIFY"));

      await expect((artistQueryResolvers.artistById as any)(null, { id: "nonexistent" }, mockContext)).rejects.toThrow(
        new GraphQLError("Resource not found on Spotify", {
          extensions: { code: "NOT_FOUND_SPOTIFY", http: { status: 404 } },
        })
      );
      expect(getArtistById).toHaveBeenCalledWith(mockContext, "nonexistent");
      expect(transformArtist).not.toHaveBeenCalled();
    });

    it("throws GraphQLError with 401 status for UNAUTHORIZED_SPOTIFY error", async () => {
      const error = new Error("UNAUTHORIZED_SPOTIFY");
      (getArtistById as any).mockRejectedValue(error);

      await expect((artistQueryResolvers.artistById as any)(null, { id: "artist123" }, mockContext)).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 status for other errors", async () => {
      const error = new Error("Network error");
      (getArtistById as any).mockRejectedValue(error);

      await expect((artistQueryResolvers.artistById as any)(null, { id: "artist123" }, mockContext)).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });

  describe("artistAlbums", () => {
    it("successfully fetches and transforms artist albums", async () => {
      (getArtistAlbums as any).mockResolvedValue(mockSpotifyAlbums);
      (createConnection as any).mockReturnValue({ edges: [], pageInfo: {}, totalCount: 2 });

      const result = await (artistQueryResolvers.artistAlbums as any)(
        null,
        { artistId: "artist123", limit: 10, offset: 0 },
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 2 });
      expect(getArtistAlbums).toHaveBeenCalledWith(mockContext, "artist123", 10, 0);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyAlbums, 0, transformAlbum);
    });

    it("handles undefined limit and offset", async () => {
      (getArtistAlbums as any).mockResolvedValue(mockSpotifyAlbums);
      (createConnection as any).mockReturnValue({ edges: [], pageInfo: {}, totalCount: 2 });

      const result = await (artistQueryResolvers.artistAlbums as any)(
        null,
        { artistId: "artist123" },
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 2 });
      expect(getArtistAlbums).toHaveBeenCalledWith(mockContext, "artist123", undefined, undefined);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyAlbums, 0, transformAlbum);
    });

    it("throws GraphQLError with 401 status for UNAUTHORIZED_SPOTIFY error", async () => {
      const error = new Error("UNAUTHORIZED_SPOTIFY");
      (getArtistAlbums as any).mockRejectedValue(error);

      await expect((artistQueryResolvers.artistAlbums as any)(
        null,
        { artistId: "artist123" },
        mockContext
      )).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 status for other errors", async () => {
      const error = new Error("Network error");
      (getArtistAlbums as any).mockRejectedValue(error);

      await expect((artistQueryResolvers.artistAlbums as any)(
        null,
        { artistId: "artist123" },
        mockContext
      )).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });
});

describe("artistFieldResolvers", () => {
  const mockContext: GraphQLContext = {
    token: "test-token",
    spotify: {} as any,
    isIntrospection: false,
    isAuthenticated: true,
  };

  const mockParent = { id: "artist123" };

  const mockSpotifyAlbums: SpotifyPaginatedResponse<SpotifyAlbum> = {
    items: [
      { id: "album1", name: "Album 1", release_date: "2023-01-01", total_tracks: 12, images: [] },
    ],
    total: 1,
    next: null,
    previous: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("albums", () => {
    it("successfully fetches and transforms artist albums", async () => {
      (getArtistAlbums as any).mockResolvedValue(mockSpotifyAlbums);
      (createConnection as any).mockReturnValue({ edges: [], pageInfo: {}, totalCount: 1 });

      const result = await (artistFieldResolvers.albums as any)(
        mockParent,
        { limit: 5, offset: 0 },
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 1 });
      expect(getArtistAlbums).toHaveBeenCalledWith(mockContext, "artist123", 5, 0);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyAlbums, 0, transformAlbum);
    });

    it("handles undefined limit and offset", async () => {
      (getArtistAlbums as any).mockResolvedValue(mockSpotifyAlbums);
      (createConnection as any).mockReturnValue({ edges: [], pageInfo: {}, totalCount: 1 });

      const result = await (artistFieldResolvers.albums as any)(
        mockParent,
        {},
        mockContext
      );

      expect(result).toEqual({ edges: [], pageInfo: {}, totalCount: 1 });
      expect(getArtistAlbums).toHaveBeenCalledWith(mockContext, "artist123", undefined, undefined);
      expect(createConnection).toHaveBeenCalledWith(mockSpotifyAlbums, 0, transformAlbum);
    });

    it("throws GraphQLError with 401 status for UNAUTHORIZED_SPOTIFY error", async () => {
      const error = new Error("UNAUTHORIZED_SPOTIFY");
      (getArtistAlbums as any).mockRejectedValue(error);

      await expect((artistFieldResolvers.albums as any)(
        mockParent,
        {},
        mockContext
      )).rejects.toThrow(
        new GraphQLError("Unauthorized: Spotify token invalid/expired", {
          extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
        })
      );
    });

    it("throws GraphQLError with 502 status for other errors", async () => {
      const error = new Error("Network error");
      (getArtistAlbums as any).mockRejectedValue(error);

      await expect((artistFieldResolvers.albums as any)(
        mockParent,
        {},
        mockContext
      )).rejects.toThrow(
        new GraphQLError("Spotify API error", {
          extensions: { code: "SPOTIFY_API_ERROR", http: { status: 502 } },
        })
      );
    });
  });
});
