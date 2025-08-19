import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";
const resolvers = {
    Query: {
        hello: () => "Hello from API with TS!",
    },
};
async function bootstrap() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: process.env.PORT ? parseInt(process.env.PORT) : 4000 },
    });
    console.log(`🚀 API ready at ${url}`);
}
bootstrap();
