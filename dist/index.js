import 'dotenv/config';
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault, } from "@apollo/server/plugin/landingPage/default";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";
const resolvers = { Query: { hello: () => "Hello from GraphQL schema 🎶" } };
const isDev = process.env.NODE_ENV !== "production";
const isBeta = process.env.ENV === "BETA";
const isBetaOrDev = isDev || isBeta;
const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: isBetaOrDev,
    plugins: [
        isBetaOrDev
            ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
            : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
});
const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
});
console.log(`🚀 GraphQL at ${url} (ENV=${process.env.ENV}, NODE_ENV=${process.env.NODE_ENV})`);
