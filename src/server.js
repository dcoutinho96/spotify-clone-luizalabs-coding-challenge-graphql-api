import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema";

const resolvers = {
  Query: { hello: () => "Hello world 👋 (from API)" }
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173"\;
app.use(cors({ origin: allowedOrigin }));
app.use("/graphql", json(), expressMiddleware(server));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
});
