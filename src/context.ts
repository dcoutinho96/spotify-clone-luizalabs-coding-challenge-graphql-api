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
  
  if (!authHeader && !isIntrospection) {
    throw new Error("Missing Authorization header");
  }
  
  const token = typeof authHeader === "string"
    ? authHeader.replace("Bearer ", "").trim()
    : null;

  if (!token && !isIntrospection) {
    throw new Error("Invalid Authorization header format");
  }

  const spotifyUrl =
    process.env.SPOTIFY_API_URL ?? "https://api.spotify.com/v1";

  const spotify = axios.create({
    baseURL: spotifyUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return {
    token,
    spotify,
  };
}