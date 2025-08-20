import 'dotenv/config';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from '@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema';

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL schema 🎶',
  },
};

const isDev = process.env.NODE_ENV !== 'production';
const isBeta = process.env.ENV === 'BETA';
const isBetaOrDev = isDev || isBeta;

const server = new ApolloServer({
  typeDefs,      
  resolvers,
  introspection: isBetaOrDev, 
  plugins: [
    isBetaOrDev
      ? ApolloServerPluginLandingPageLocalDefault({ embed: true }) // full Sandbox UI
      : ApolloServerPluginLandingPageProductionDefault({ footer: false }), // minimal prod page (no graphRef needed)
  ],
});

const port = Number(process.env.PORT) || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => ({ auth: req.headers.authorization ?? null }),
  // cors: { origin: ['http://localhost:5173', 'https://your-frontend.app'], credentials: false },
});

console.log(`🚀 GraphQL at ${url}`);
console.log(`    ENV=${process.env.ENV ?? '(unset)'} NODE_ENV=${process.env.NODE_ENV ?? '(unset)'}`);
