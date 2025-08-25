import axios from "axios";
import { GraphQLError } from "graphql";

export const SPOTIFY_ERRORS = {
  UNAUTHORIZED: "UNAUTHORIZED_SPOTIFY",
  NOT_FOUND: "NOT_FOUND_SPOTIFY",
  GENERIC: "SPOTIFY_API_ERROR",
} as const;

export function handleSpotifyError(err: unknown): never {
  console.error("🔴 handleSpotifyError caught:", err);

  if (err instanceof Error) {
    console.error("🔎 Error.message:", err.message);

    if (err.message === SPOTIFY_ERRORS.UNAUTHORIZED) {
      throw new GraphQLError("Unauthorized: Spotify token invalid/expired", {
        extensions: { code: SPOTIFY_ERRORS.UNAUTHORIZED, http: { status: 401 } },
      });
    }
    if (err.message === SPOTIFY_ERRORS.NOT_FOUND) {
      throw new GraphQLError("Resource not found on Spotify", {
        extensions: { code: SPOTIFY_ERRORS.NOT_FOUND, http: { status: 404 } },
      });
    }
  }

  throw new GraphQLError("Spotify API error", {
    extensions: { code: SPOTIFY_ERRORS.GENERIC, http: { status: 502 } },
  });
}

export function extractSpotifyStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) {
    if (err.response?.status) return err.response.status;
    if (err.response?.data?.error?.status) return err.response.data.error.status;
  }
  return undefined;
}