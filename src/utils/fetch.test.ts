import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchSafeResource } from "./fetch";
import type { GraphQLContext } from "#context";

// Mock GraphQLContext
const mockContext: GraphQLContext = {
  token: "test-token",
  spotify: {
    get: vi.fn(),
  } as any,
  isIntrospection: false,
  isAuthenticated: true,
};

describe("fetchSafeResource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully fetches and returns data", async () => {
    const mockData = { id: "123", name: "Test" };
    mockContext.spotify.get = vi.fn().mockResolvedValue({ data: mockData });

    const result = await fetchSafeResource(mockContext, "/test-endpoint");

    expect(result).toEqual(mockData);
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("throws UNAUTHORIZED_SPOTIFY error on 401 status", async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 401 },
    };
    mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

    await expect(fetchSafeResource(mockContext, "/test-endpoint")).rejects.toThrow("UNAUTHORIZED_SPOTIFY");
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("returns null for non-401 axios errors", async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 500 },
    };
    mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

    const result = await fetchSafeResource(mockContext, "/test-endpoint");

    expect(result).toBeNull();
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("returns null for non-axios errors", async () => {
    const regularError = new Error("Network error");
    mockContext.spotify.get = vi.fn().mockRejectedValue(regularError);

    const result = await fetchSafeResource(mockContext, "/test-endpoint");

    expect(result).toBeNull();
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("returns null for axios errors without response status", async () => {
    const axiosError = {
      isAxiosError: true,
      response: undefined,
    };
    mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

    const result = await fetchSafeResource(mockContext, "/test-endpoint");

    expect(result).toBeNull();
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });

  it("returns null for axios errors with null response", async () => {
    const axiosError = {
      isAxiosError: true,
      response: null,
    };
    mockContext.spotify.get = vi.fn().mockRejectedValue(axiosError);

    const result = await fetchSafeResource(mockContext, "/test-endpoint");

    expect(result).toBeNull();
    expect(mockContext.spotify.get).toHaveBeenCalledWith("/test-endpoint");
  });
});
