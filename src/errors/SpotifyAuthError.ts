import { GraphQLError } from "graphql";

export class SpotifyAuthError extends GraphQLError {
  constructor(message = "Unauthorized: Spotify token invalid or expired") {
    super(message, {
      extensions: { code: "UNAUTHORIZED_SPOTIFY", http: { status: 401 } },
    });
  }
}
