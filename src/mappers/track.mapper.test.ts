import { describe, it, expect } from "vitest";
import { transformTrack } from "./track.mapper";
import type { SpotifyTrack } from "#types/spotify";

describe("track mapper", () => {
  it("transforms Spotify track with all fields", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track123",
      name: "Test Track",
      duration_ms: 180000,
      preview_url: "https://example.com/preview.mp3",
      album: {
        id: "album123",
        name: "Test Album",
        release_date: "2023-01-15",
        total_tracks: 12,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist1",
          name: "Artist 1",
          genres: ["rock"],
          popularity: 80,
          images: [{ url: "https://example.com/artist1.jpg", height: 300, width: 300 }],
        },
        {
          id: "artist2",
          name: "Artist 2",
          genres: ["pop"],
          popularity: 75,
          images: [{ url: "https://example.com/artist2.jpg", height: 300, width: 300 }],
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track123",
      name: "Test Track",
      durationMs: 180000,
      previewUrl: "https://example.com/preview.mp3",
      album: {
        id: "album123",
        name: "Test Album",
        releaseDate: "2023-01-15",
        totalTracks: 12,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
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
        },
        {
          id: "artist2",
          name: "Artist 2",
          genres: ["pop"],
          popularity: 75,
          images: [{ url: "https://example.com/artist2.jpg", height: 300, width: 300 }],
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
        },
      ],
    });
  });

  it("transforms Spotify track with single artist", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track456",
      name: "Single Artist Track",
      duration_ms: 240000,
      preview_url: "https://example.com/single.mp3",
      album: {
        id: "album456",
        name: "Single Artist Album",
        release_date: "2023-06-20",
        total_tracks: 8,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist456",
          name: "Single Artist",
          genres: ["jazz"],
          popularity: 70,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track456",
      name: "Single Artist Track",
      durationMs: 240000,
      previewUrl: "https://example.com/single.mp3",
      album: {
        id: "album456",
        name: "Single Artist Album",
        releaseDate: "2023-06-20",
        totalTracks: 8,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist456",
          name: "Single Artist",
          genres: ["jazz"],
          popularity: 70,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
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
        },
      ],
    });
  });

  it("transforms Spotify track with no preview URL", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track789",
      name: "No Preview Track",
      duration_ms: 300000,
      preview_url: null,
      album: {
        id: "album789",
        name: "No Preview Album",
        release_date: "2022-12-01",
        total_tracks: 15,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist789",
          name: "No Preview Artist",
          genres: ["electronic"],
          popularity: 85,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track789",
      name: "No Preview Track",
      durationMs: 300000,
      previewUrl: null,
      album: {
        id: "album789",
        name: "No Preview Album",
        releaseDate: "2022-12-01",
        totalTracks: 15,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist789",
          name: "No Preview Artist",
          genres: ["electronic"],
          popularity: 85,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
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
        },
      ],
    });
  });

  it("transforms Spotify track with album without images", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track999",
      name: "No Album Image Track",
      duration_ms: 150000,
      preview_url: "https://example.com/noimage.mp3",
      album: {
        id: "album999",
        name: "No Image Album",
        release_date: "2023-03-10",
        total_tracks: 10,
        images: null,
      },
      artists: [
        {
          id: "artist999",
          name: "No Album Image Artist",
          genres: ["folk"],
          popularity: 60,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track999",
      name: "No Album Image Track",
      durationMs: 150000,
      previewUrl: "https://example.com/noimage.mp3",
      album: {
        id: "album999",
        name: "No Image Album",
        releaseDate: "2023-03-10",
        totalTracks: 10,
        images: [],
      },
      artists: [
        {
          id: "artist999",
          name: "No Album Image Artist",
          genres: ["folk"],
          popularity: 60,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
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
        },
      ],
    });
  });

  it("transforms Spotify track with artist without images", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track111",
      name: "No Artist Image Track",
      duration_ms: 200000,
      preview_url: "https://example.com/noartistimage.mp3",
      album: {
        id: "album111",
        name: "No Artist Image Album",
        release_date: "2023-08-05",
        total_tracks: 6,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist111",
          name: "No Image Artist",
          genres: ["classical"],
          popularity: 90,
          images: null,
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track111",
      name: "No Artist Image Track",
      durationMs: 200000,
      previewUrl: "https://example.com/noartistimage.mp3",
      album: {
        id: "album111",
        name: "No Artist Image Album",
        releaseDate: "2023-08-05",
        totalTracks: 6,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist111",
          name: "No Image Artist",
          genres: ["classical"],
          popularity: 90,
          images: [],
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
        },
      ],
    });
  });

  it("transforms Spotify track with album with null optional fields", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track222",
      name: "Null Album Fields Track",
      duration_ms: 180000,
      preview_url: "https://example.com/nullfields.mp3",
      album: {
        id: "album222",
        name: "Null Fields Album",
        release_date: null,
        total_tracks: null,
        images: null,
      },
      artists: [
        {
          id: "artist222",
          name: "Null Fields Artist",
          genres: ["experimental"],
          popularity: 55,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track222",
      name: "Null Album Fields Track",
      durationMs: 180000,
      previewUrl: "https://example.com/nullfields.mp3",
      album: {
        id: "album222",
        name: "Null Fields Album",
        releaseDate: null,
        totalTracks: null,
        images: [],
      },
      artists: [
        {
          id: "artist222",
          name: "Null Fields Artist",
          genres: ["experimental"],
          popularity: 55,
          images: [{ url: "https://example.com/artist.jpg", height: 300, width: 300 }],
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
        },
      ],
    });
  });

  it("transforms Spotify track with artist with null optional fields", () => {
    const spotifyTrack: SpotifyTrack = {
      id: "track333",
      name: "Null Artist Fields Track",
      duration_ms: 160000,
      preview_url: "https://example.com/nullartistfields.mp3",
      album: {
        id: "album333",
        name: "Null Artist Fields Album",
        release_date: "2023-11-30",
        total_tracks: 20,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist333",
          name: "Null Fields Artist",
          genres: null,
          popularity: null,
          images: null,
        },
      ],
    };

    const result = transformTrack(spotifyTrack);

    expect(result).toEqual({
      id: "track333",
      name: "Null Artist Fields Track",
      durationMs: 160000,
      previewUrl: "https://example.com/nullartistfields.mp3",
      album: {
        id: "album333",
        name: "Null Artist Fields Album",
        releaseDate: "2023-11-30",
        totalTracks: 20,
        images: [{ url: "https://example.com/album.jpg", height: 300, width: 300 }],
      },
      artists: [
        {
          id: "artist333",
          name: "Null Fields Artist",
          genres: [],
          popularity: null,
          images: [],
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
        },
      ],
    });
  });
});
