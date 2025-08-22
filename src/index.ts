import { startStandaloneServer } from "@apollo/server/standalone";
import { createApolloServer } from "./app";
import { createContext, GraphQLContext } from "./context";

async function main() {
  const server = createApolloServer();

  const { url } = await startStandaloneServer<GraphQLContext>(server, {
    context: async ({ req }) => {
      return createContext({ req }); 
    },
    listen: { port: Number(process.env.PORT) || 4000 },
  });

  console.info(`🚀 Server ready at ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
