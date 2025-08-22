import { describe, it, expect, beforeEach, vi } from "vitest";
import type { IncomingMessage } from "http";
import axios from "axios";
import { createContext } from "./context";

vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({ mock: true })),
    },
  };
});

describe("createContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPOTIFY_API_URL;
  });

  it("throws if no Authorization header is provided", async () => {
    const req = { headers: {} } as unknown as IncomingMessage;
    await expect(createContext({ req })).rejects.toThrow(
      "Missing Authorization header"
    );
  });

  it("throws if Authorization header is empty after stripping", async () => {
    const req = {
      headers: { authorization: "Bearer " },
    } as unknown as IncomingMessage;
    await expect(createContext({ req })).rejects.toThrow(
      "Invalid Authorization header format"
    );
  });

  it("creates context with default Spotify URL when env is not set", async () => {
    const req = {
      headers: { authorization: "Bearer test-token" },
    } as unknown as IncomingMessage;

    const ctx = await createContext({ req });

    expect(ctx.token).toBe("test-token");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.spotify.com/v1",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(ctx.spotify).toEqual({ mock: true });
  });

  it("uses SPOTIFY_API_URL from env if provided", async () => {
    process.env.SPOTIFY_API_URL = "https://custom.spotify.api";
    const req = {
      headers: { authorization: "Bearer abc123" },
    } as unknown as IncomingMessage;

    const ctx = await createContext({ req });

    expect(ctx.token).toBe("abc123");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://custom.spotify.api",
      headers: { Authorization: "Bearer abc123" },
    });
  });
});
