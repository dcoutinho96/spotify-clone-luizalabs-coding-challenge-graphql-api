import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { createSpotifyClient } from "./client";

vi.mock("axios", () => ({
  default: {
    create: vi.fn(),
  },
}));

describe("createSpotifyClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPOTIFY_API_URL;
  });

  it("creates client with token and default URL", () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("test-token");

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.spotify.com/v1",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(client.interceptors.response.use).toHaveBeenCalled();
  });

  it("creates client with token and custom URL from env", () => {
    process.env.SPOTIFY_API_URL = "https://custom.spotify.api";
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("test-token");

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://custom.spotify.api",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(client.interceptors.response.use).toHaveBeenCalled();
  });

  it("creates client without token", () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient(null);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.spotify.com/v1",
      headers: {},
    });
    expect(client.interceptors.response.use).toHaveBeenCalled();
  });

  it("creates client with empty token string", () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("");

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.spotify.com/v1",
      headers: {},
    });
    expect(client.interceptors.response.use).toHaveBeenCalled();
  });

  it("sets isUnauthenticated flag on 401 responses", async () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("test-token");

    // Get the error interceptor function that was passed to use()
    const errorInterceptorFn = (client.interceptors.response.use as any).mock.calls[0][1];
    
    // Create a mock error with 401 status
    const mockError = {
      response: { status: 401 },
    };

    // Call the error interceptor function and await the rejection
    await expect(errorInterceptorFn(mockError)).rejects.toEqual(mockError);
    
    // Check that the flag was set
    expect((mockError as any).isUnauthenticated).toBe(true);
  });

  it("does not set isUnauthenticated flag on non-401 responses", async () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("test-token");

    // Get the error interceptor function that was passed to use()
    const errorInterceptorFn = (client.interceptors.response.use as any).mock.calls[0][1];
    
    // Create a mock error with 500 status
    const mockError = {
      response: { status: 500 },
    };

    // Call the error interceptor function and await the rejection
    await expect(errorInterceptorFn(mockError)).rejects.toEqual(mockError);
    
    // Check that the flag was not set
    expect((mockError as any).isUnauthenticated).toBeUndefined();
  });

  it("handles errors without response status", async () => {
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);

    const client = createSpotifyClient("test-token");

    // Get the error interceptor function that was passed to use()
    const errorInterceptorFn = (client.interceptors.response.use as any).mock.calls[0][1];
    
    // Create a mock error without response
    const mockError = {};

    // Call the error interceptor function and await the rejection
    await expect(errorInterceptorFn(mockError)).rejects.toEqual(mockError);
  });
});
