import { describe, it, expect } from "vitest";
import { transformPlaylist } from "./playlist.mapper";
import type { SpotifyPlaylist } from "#types/spotify";

describe("playlist mapper", () => {
  it("transforms Spotify playlist with all fields", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist123",
      name: "Test Playlist",
      description: "A test playlist for testing",
      public: true,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
      owner: {
        id: "user123",
        display_name: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist123",
      name: "Test Playlist",
      description: "A test playlist for testing",
      public: true,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
      owner: {
        id: "user123",
        displayName: "Test User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with single image", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist456",
      name: "Single Image Playlist",
      description: "A playlist with one image",
      public: false,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
      owner: {
        id: "user456",
        display_name: "Single Image User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist456",
      name: "Single Image Playlist",
      description: "A playlist with one image",
      public: false,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
      owner: {
        id: "user456",
        displayName: "Single Image User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with no images", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist789",
      name: "No Image Playlist",
      description: "A playlist without images",
      public: true,
      images: null,
      owner: {
        id: "user789",
        display_name: "No Image User",
        images: null,
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist789",
      name: "No Image Playlist",
      description: "A playlist without images",
      public: true,
      images: [],
      owner: {
        id: "user789",
        displayName: "No Image User",
        images: [],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with empty images array", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist999",
      name: "Empty Images Playlist",
      description: "A playlist with empty images",
      public: false,
      images: [],
      owner: {
        id: "user999",
        display_name: "Empty Images User",
        images: [],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist999",
      name: "Empty Images Playlist",
      description: "A playlist with empty images",
      public: false,
      images: [],
      owner: {
        id: "user999",
        displayName: "Empty Images User",
        images: [],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with images without height/width", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist111",
      name: "Partial Image Playlist",
      description: "A playlist with partial images",
      public: true,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
      owner: {
        id: "user111",
        display_name: "Partial Image User",
        images: [{ url: "https://example.com/user.jpg" }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist111",
      name: "Partial Image Playlist",
      description: "A playlist with partial images",
      public: true,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
      owner: {
        id: "user111",
        displayName: "Partial Image User",
        images: [{ url: "https://example.com/user.jpg" }],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with null description", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist222",
      name: "No Description Playlist",
      description: null,
      public: false,
      images: [{ url: "https://example.com/nodesc.jpg", height: 300, width: 300 }],
      owner: {
        id: "user222",
        display_name: "No Description User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist222",
      name: "No Description Playlist",
      description: null,
      public: false,
      images: [{ url: "https://example.com/nodesc.jpg", height: 300, width: 300 }],
      owner: {
        id: "user222",
        displayName: "No Description User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with null public", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist333",
      name: "Unknown Public Playlist",
      description: "A playlist with unknown public status",
      public: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
      owner: {
        id: "user333",
        display_name: "Unknown Public User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist333",
      name: "Unknown Public Playlist",
      description: "A playlist with unknown public status",
      public: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
      owner: {
        id: "user333",
        displayName: "Unknown Public User",
        images: [{ url: "https://example.com/user.jpg", height: 300, width: 300 }],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });

  it("transforms Spotify playlist with all null optional fields", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist444",
      name: "Minimal Playlist",
      description: null,
      public: null,
      images: null,
      owner: {
        id: "user444",
        display_name: "Minimal User",
        images: null,
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist444",
      name: "Minimal Playlist",
      description: null,
      public: null,
      images: [],
      owner: {
        id: "user444",
        displayName: "Minimal User",
        images: [],
      },
      tracks: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
    });
  });
});
