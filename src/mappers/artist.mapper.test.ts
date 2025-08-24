import { describe, it, expect } from "vitest";
import { transformArtist } from "./artist.mapper";
import type { SpotifyArtist } from "#types/spotify";

describe("artist mapper", () => {
  it("transforms Spotify artist with all fields", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist123",
      name: "Test Artist",
      genres: ["rock", "pop", "alternative"],
      popularity: 85,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist123",
      name: "Test Artist",
      genres: ["rock", "pop", "alternative"],
      popularity: 85,
      images: [
        { url: "https://example.com/image1.jpg", height: 300, width: 300 },
        { url: "https://example.com/image2.jpg", height: 150, width: 150 },
      ],
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
    });
  });

  it("transforms Spotify artist with single genre", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist456",
      name: "Single Genre Artist",
      genres: ["jazz"],
      popularity: 70,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist456",
      name: "Single Genre Artist",
      genres: ["jazz"],
      popularity: 70,
      images: [{ url: "https://example.com/single.jpg", height: 300, width: 300 }],
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
    });
  });

  it("transforms Spotify artist with no genres", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist789",
      name: "No Genre Artist",
      genres: null,
      popularity: 60,
      images: [{ url: "https://example.com/nogenre.jpg", height: 300, width: 300 }],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist789",
      name: "No Genre Artist",
      genres: [],
      popularity: 60,
      images: [{ url: "https://example.com/nogenre.jpg", height: 300, width: 300 }],
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
    });
  });

  it("transforms Spotify artist with empty genres array", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist999",
      name: "Empty Genres Artist",
      genres: [],
      popularity: 50,
      images: [{ url: "https://example.com/empty.jpg", height: 300, width: 300 }],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist999",
      name: "Empty Genres Artist",
      genres: [],
      popularity: 50,
      images: [{ url: "https://example.com/empty.jpg", height: 300, width: 300 }],
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
    });
  });

  it("transforms Spotify artist with no images", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist111",
      name: "No Image Artist",
      genres: ["electronic"],
      popularity: 75,
      images: null,
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist111",
      name: "No Image Artist",
      genres: ["electronic"],
      popularity: 75,
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
    });
  });

  it("transforms Spotify artist with empty images array", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist222",
      name: "Empty Images Artist",
      genres: ["classical"],
      popularity: 90,
      images: [],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist222",
      name: "Empty Images Artist",
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
    });
  });

  it("transforms Spotify artist with images without height/width", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist333",
      name: "Partial Image Artist",
      genres: ["folk"],
      popularity: 65,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist333",
      name: "Partial Image Artist",
      genres: ["folk"],
      popularity: 65,
      images: [
        { url: "https://example.com/partial.jpg" },
        { url: "https://example.com/complete.jpg", height: 300, width: 300 },
      ],
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
    });
  });

  it("transforms Spotify artist with null popularity", () => {
    const spotifyArtist: SpotifyArtist = {
      id: "artist444",
      name: "Unknown Popularity Artist",
      genres: ["experimental"],
      popularity: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
    };

    const result = transformArtist(spotifyArtist);

    expect(result).toEqual({
      id: "artist444",
      name: "Unknown Popularity Artist",
      genres: ["experimental"],
      popularity: null,
      images: [{ url: "https://example.com/unknown.jpg", height: 300, width: 300 }],
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
    });
  });
});
