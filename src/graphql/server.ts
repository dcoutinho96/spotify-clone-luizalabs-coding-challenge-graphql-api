import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

import { GraphQLContext } from "#context";
import { resolvers } from "#graphql/resolvers";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";

export function createApolloServer() {
  const isDev = process.env.NODE_ENV !== "production";
  const isBeta = process.env.ENV === "BETA";
  const isBetaOrDev = isDev || isBeta;

  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [
      isBetaOrDev
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
  });
}
