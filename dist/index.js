import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";
const resolvers = {
    Query: {
        hello: () => "Hello from GraphQL schema 🎶",
    },
};
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT ? Number(process.env.PORT) : 4000 },
});
console.log(`🚀 GraphQL ready at ${url}`);
