import "dotenv/config";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createApolloServer } from "./app.js";

const server = createApolloServer();
const port = Number(process.env.PORT) || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => ({ auth: req.headers.authorization ?? null }),
});

console.info(`🚀 GraphQL at ${url}`);
console.info(
  `    ENV=${process.env.ENV ?? "(unset)"} NODE_ENV=${process.env.NODE_ENV ?? "(unset)"}`
);
