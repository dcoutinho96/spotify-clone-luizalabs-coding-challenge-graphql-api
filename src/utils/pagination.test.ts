import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEmptyConnection, createPageInfo, createConnection, getPaginatedData } from "./pagination";
import type { GraphQLContext } from "#context";
import type { SpotifyPaginatedResponse } from "#types/spotify";

// Mock GraphQLContext
const mockContext: GraphQLContext = {
  token: "test-token",
  spotify: {
    get: vi.fn(),
  } as any,
  isIntrospection: false,
  isAuthenticated: true,
};

describe("pagination utilities", () => {
  describe("createEmptyConnection", () => {
    it("creates an empty connection with correct structure", () => {
      const result = createEmptyConnection();

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
    });
  });

  describe("createPageInfo", () => {
    it("creates page info with next and previous pages", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1" }, { id: "2" }],
        total: 10,
        next: "next-url",
        previous: "prev-url",
      };

      const result = createPageInfo(mockData, 0, 2);

      expect(result).toEqual({
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: "0",
        endCursor: "1",
      });
    });

    it("creates page info without next and previous pages", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1" }],
        total: 1,
        next: null,
        previous: null,
      };

      const result = createPageInfo(mockData, 0, 1);

      expect(result).toEqual({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "0",
        endCursor: "0",
      });
    });

    it("handles empty items array", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      const result = createPageInfo(mockData, 0, 0);

      expect(result).toEqual({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      });
    });
  });

  describe("createConnection", () => {
    it("creates connection with transformed items", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1", name: "Item 1" }, { id: "2", name: "Item 2" }],
        total: 2,
        next: null,
        previous: null,
      };

      const transformer = (item: any) => ({ transformedId: item.id, transformedName: item.name });

      const result = createConnection(mockData, 0, transformer);

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]).toEqual({
        cursor: "0",
        node: { transformedId: "1", transformedName: "Item 1" },
      });
      expect(result.edges[1]).toEqual({
        cursor: "1",
        node: { transformedId: "2", transformedName: "Item 2" },
      });
      expect(result.totalCount).toBe(2);
    });

    it("filters out null items", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1" }, null, { id: "3" }],
        total: 3,
        next: null,
        previous: null,
      };

      const transformer = (item: any) => ({ id: item.id });

      const result = createConnection(mockData, 0, transformer);

      expect(result.edges).toHaveLength(2);
      expect(result.totalCount).toBe(3);
    });

    it("handles empty items array", () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [],
        total: 0,
        next: null,
        previous: null,
      };

      const transformer = (item: any) => ({ id: item.id });

      const result = createConnection(mockData, 0, transformer);

      expect(result.edges).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("getPaginatedData", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("successfully fetches paginated data", async () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1" }, { id: "2" }],
        total: 2,
        next: null,
        previous: null,
      };

      mockContext.spotify.get = vi.fn().mockResolvedValue({ data: mockData });

      const result = await getPaginatedData(mockContext, "/test-endpoint", 2, 0);

      expect(result).toEqual(mockData);
      expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint", {
        params: { limit: 2, offset: 0 },
      });
    });

    it("uses default limit and offset when not provided", async () => {
      const mockData: SpotifyPaginatedResponse<any> = {
        items: [{ id: "1" }],
        total: 1,
        next: null,
        previous: null,
      };

      mockContext.spotify.get = vi.fn().mockResolvedValue({ data: mockData });

      const result = await getPaginatedData(mockContext, "/test-endpoint");

      expect(result).toEqual(mockData);
      expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint", {
        params: { limit: 20, offset: 0 },
      });
    });

    it("throws UNAUTHORIZED_SPOTIFY error on 401 status", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401 },
      };
      mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

      await expect(getPaginatedData(mockContext, "/test-endpoint")).rejects.toThrow("UNAUTHORIZED_SPOTIFY");
    });

    it("throws NOT_FOUND_SPOTIFY for other 4xx statuses (e.g., 400)", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 400 },
      };
      mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

      await expect(getPaginatedData(mockContext, "/test-endpoint")).rejects.toThrow("NOT_FOUND_SPOTIFY");
    });

    it("throws SPOTIFY_API_ERROR for other errors", async () => {
      const regularError = new Error("Network error");
      mockContext.spotify.get = vi.fn().mockRejectedValue(regularError);

      await expect(getPaginatedData(mockContext, "/test-endpoint")).rejects.toThrow("SPOTIFY_API_ERROR");
    });
  });
});
