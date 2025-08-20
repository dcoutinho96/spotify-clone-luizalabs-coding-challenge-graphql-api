import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";

export const resolvers = {
  Query: {
    hello: () => "Hello World!!!",
  },
};

export type EnvLike = Partial<Record<"NODE_ENV" | "ENV" | "PORT", string>>;

export function createApolloServer(env?: EnvLike): ApolloServer {
  const e = { ...process.env, ...env } as Record<string, string | undefined>;

  const isDev = e.NODE_ENV !== "production";
  const isBeta = e.ENV === "BETA";
  const isBetaOrDev = isDev || isBeta;

  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: isBetaOrDev,
    plugins: [
      isBetaOrDev
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
  });
}
