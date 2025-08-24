import { describe, it, expect } from "vitest";
import { transformUser } from "./user.mapper";
import type { SpotifyUser } from "#types/spotify";

describe("user mapper", () => {
  it("transforms Spotify user with all fields", () => {
    const spotifyUser: SpotifyUser = {
      id: "user123",
      display_name: "Test User",
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
    };

    const result = transformUser(spotifyUser);

    expect(result).toEqual({
      id: "user123",
      displayName: "Test User",
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
    });
  });

  it("transforms Spotify user with single image", () => {
    const spotifyUser: SpotifyUser = {
      id: "user456",
      display_name: "Single Image User",
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
    };

    const result = transformUser(spotifyUser);

    expect(result).toEqual({
      id: "user456",
      displayName: "Single Image User",
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
    });
  });

  it("transforms Spotify user with no images", () => {
    const spotifyUser: SpotifyUser = {
      id: "user789",
      display_name: "No Image User",
      images: null,
    };

    const result = transformUser(spotifyUser);

    expect(result).toEqual({
      id: "user789",
      displayName: "No Image User",
      images: [],
    });
  });

  it("transforms Spotify user with empty images array", () => {
    const spotifyUser: SpotifyUser = {
      id: "user999",
      display_name: "Empty Images User",
      images: [],
    };

    const result = transformUser(spotifyUser);

    expect(result).toEqual({
      id: "user999",
      displayName: "Empty Images User",
      images: [],
    });
  });

  it("transforms Spotify user with images without height/width", () => {
    const spotifyUser: SpotifyUser = {
      id: "user111",
      display_name: "Partial Image User",
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
    };

    const result = transformUser(spotifyUser);

    expect(result).toEqual({
      id: "user111",
      displayName: "Partial Image User",
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
    });
  });
});
