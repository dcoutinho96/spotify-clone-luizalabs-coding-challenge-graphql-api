import { describe, it, expect } from "vitest";
import { transformAlbum } from "./album.mapper";
import type { SpotifyAlbum } from "#types/spotify";

describe("album mapper", () => {
  it("transforms Spotify album with all fields", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album123",
      name: "Test Album",
      release_date: "2023-01-15",
      total_tracks: 12,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album123",
      name: "Test Album",
      releaseDate: "2023-01-15",
      totalTracks: 12,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
    });
  });

  it("transforms Spotify album with single image", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album456",
      name: "Single Image Album",
      release_date: "2023-06-20",
      total_tracks: 8,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album456",
      name: "Single Image Album",
      releaseDate: "2023-06-20",
      totalTracks: 8,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
    });
  });

  it("transforms Spotify album with no images", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album789",
      name: "No Image Album",
      release_date: "2022-12-01",
      total_tracks: 15,
      images: null,
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album789",
      name: "No Image Album",
      releaseDate: "2022-12-01",
      totalTracks: 15,
      images: [],
    });
  });

  it("transforms Spotify album with empty images array", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album999",
      name: "Empty Images Album",
      release_date: "2023-03-10",
      total_tracks: 10,
      images: [],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album999",
      name: "Empty Images Album",
      releaseDate: "2023-03-10",
      totalTracks: 10,
      images: [],
    });
  });

  it("transforms Spotify album with images without height/width", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album111",
      name: "Partial Image Album",
      release_date: "2023-08-05",
      total_tracks: 6,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album111",
      name: "Partial Image Album",
      releaseDate: "2023-08-05",
      totalTracks: 6,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
    });
  });

  it("transforms Spotify album with null release date", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album222",
      name: "Unknown Release Album",
      release_date: null,
      total_tracks: 20,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album222",
      name: "Unknown Release Album",
      releaseDate: null,
      totalTracks: 20,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
    });
  });

  it("transforms Spotify album with null total tracks", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album333",
      name: "Unknown Tracks Album",
      release_date: "2023-11-30",
      total_tracks: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album333",
      name: "Unknown Tracks Album",
      releaseDate: "2023-11-30",
      totalTracks: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
    });
  });

  it("transforms Spotify album with all null optional fields", () => {
    const spotifyAlbum: SpotifyAlbum = {
      id: "album444",
      name: "Minimal Album",
      release_date: null,
      total_tracks: null,
      images: null,
    };

    const result = transformAlbum(spotifyAlbum);

    expect(result).toEqual({
      id: "album444",
      name: "Minimal Album",
      releaseDate: null,
      totalTracks: null,
      images: [],
    });
  });
});
