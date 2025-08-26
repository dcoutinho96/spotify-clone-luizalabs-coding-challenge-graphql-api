import { describe, it, expect } from "vitest";
import { transformPlaylist } from "./playlist.mapper";
import type { SpotifyPlaylist } from "#types/spotify";

describe("playlist mapper", () => {
  it("maps playlist with valid owner", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist001",
      name: "Cool Playlist",
      description: "desc",
      public: true,
      images: [{ url: "https://example.com/cover.jpg", height: 300, width: 300 }],
      owner: {
        id: "owner001",
        display_name: "Cool Owner",
        images: [{ url: "https://example.com/owner.jpg", height: 64, width: 64 }],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toEqual({
      id: "playlist001",
      name: "Cool Playlist",
      description: "desc",
      public: true,
      images: [{ url: "https://example.com/cover.jpg", height: 300, width: 300 }],
      owner: {
        id: "owner001",
        displayName: "Cool Owner",
        images: [{ url: "https://example.com/owner.jpg", height: 64, width: 64 }],
        __typename: "User",
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

  it("falls back to id when owner.display_name is null", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist123",
      name: "Test Playlist",
      description: "desc",
      public: true,
      images: [],
      owner: {
        id: "owner123",
        display_name: null,
        images: [],
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result.owner).toEqual({
      id: "owner123",
      displayName: "owner123",
      images: [],
      __typename: "User",
    });
  });

  it("falls back to Unknown User when owner is missing", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist456",
      name: "Playlist without owner",
      description: null,
      public: false,
      images: [],
      owner: null as any, // simulating missing owner
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result.owner).toEqual({
      id: "unknown",
      displayName: "Unknown User",
      images: [],
      __typename: "User",
    });
  });

  it("handles missing description and images gracefully", () => {
    const spotifyPlaylist: SpotifyPlaylist = {
      id: "playlist789",
      name: "Playlist no desc/images",
      description: null,
      public: null,
      images: null as any, // simulating API returning null
      owner: {
        id: "owner789",
        display_name: "Owner Name",
        images: null as any,
      },
    };

    const result = transformPlaylist(spotifyPlaylist);

    expect(result).toMatchObject({
      id: "playlist789",
      name: "Playlist no desc/images",
      description: null,
      public: null,
      images: [],
      owner: {
        id: "owner789",
        displayName: "Owner Name",
        images: [],
      },
    });
  });
});
