import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { createContext } from "./context";

vi.mock("axios", () => {
  const mockAxiosInstance = {
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn((err) => !!err && err.isAxiosError),
    },
  };
});

describe("createContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPOTIFY_API_URL;
  });

  it("creates context with isAuthenticated = false if no Authorization header", async () => {
    const req = { headers: {} } as any;
    const ctx = await createContext({ req });

    expect(ctx.token).toBeNull();
    expect(ctx.isAuthenticated).toBe(false);
    expect(ctx.spotify.interceptors.response.use).toHaveBeenCalled();
  });

  it("creates context with isAuthenticated = false if Authorization header is empty after stripping", async () => {
    const req = { headers: { authorization: "Bearer " } } as any;
    const ctx = await createContext({ req });

    expect(ctx.token).toBe("");
    expect(ctx.isAuthenticated).toBe(false);
  });

  it("creates context with default Spotify URL when env is not set", async () => {
    const req = { headers: { authorization: "Bearer test-token" } } as any;
    const ctx = await createContext({ req });

    expect(ctx.token).toBe("test-token");
    expect(ctx.isAuthenticated).toBe(true);
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.spotify.com/v1",
      headers: { Authorization: "Bearer test-token" },
    });
  });

  it("uses SPOTIFY_API_URL from env if provided", async () => {
    process.env.SPOTIFY_API_URL = "https://custom.spotify.api";
    const req = { headers: { authorization: "Bearer abc123" } } as any;

    const ctx = await createContext({ req });

    expect(ctx.token).toBe("abc123");
    expect(ctx.isAuthenticated).toBe(true);
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://custom.spotify.api",
      headers: { Authorization: "Bearer abc123" },
    });
  });

  it("detects introspection queries", async () => {
    const req = {
      headers: {},
      body: { query: "{ __schema { types { name } } }" },
    } as any;

    const ctx = await createContext({ req });

    expect(ctx.isIntrospection).toBe(true);
    expect(ctx.isAuthenticated).toBe(false);
  });
});
