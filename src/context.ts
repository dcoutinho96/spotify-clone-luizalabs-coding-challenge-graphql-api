import { parse, visit } from "graphql";
import { createSpotifyClient } from "#services/spotify/client";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  body?: {
    query?: string;
    operationName?: string;
  };
}

export interface GraphQLContext {
  token: string | null;
  spotify: ReturnType<typeof createSpotifyClient>;
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
    } catch (_error) {
      throw new Error("Failed to parse GraphQL query for introspection detection");
    }
  }

  const authHeader = req.headers["authorization"];
  const token =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "").trim()
      : null;

  const isAuthenticated = !!token;

  const spotify = createSpotifyClient(token);

  return {
    token,
    spotify,
    isIntrospection,
    isAuthenticated,
  };
}
