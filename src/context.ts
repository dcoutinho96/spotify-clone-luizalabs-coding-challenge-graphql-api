import axios from "axios";
import { parse, visit } from "graphql";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  body?: {
    query?: string;
    operationName?: string;
  };
}

export interface GraphQLContext {
  token: string | null;
  spotify: ReturnType<typeof axios.create>;
  isIntrospection: boolean;
  isAuthenticated: boolean;
}

export async function createContext({
  req,
}: {
  req: RequestLike;
}): Promise<GraphQLContext> {
  const body = req.body;
  let isIntrospection = false;

  if (body?.query) {
    try {
      const document = parse(body.query);

      visit(document, {
        Field(node) {
          if (node.name.value.startsWith("__")) {
            isIntrospection = true;
            return false;
          }
        },
      });
    } catch {
      // Ignore parse errors, treat as non-introspection
    }
  }

  const authHeader = req.headers["authorization"];
  const token =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "").trim()
      : null;

  const isAuthenticated = !!token;

  const spotifyUrl = process.env.SPOTIFY_API_URL ?? "https://api.spotify.com/v1";

  const spotify = axios.create({
    baseURL: spotifyUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  spotify.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return Promise.reject({ ...error, isUnauthenticated: true });
      }
      return Promise.reject(error);
    }
  );

  return {
    token,
    spotify,
    isIntrospection,
    isAuthenticated,
  };
}
