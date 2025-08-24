import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApolloServer } from "@apollo/server";
import { createApolloServer } from "./server";

// Mock ApolloServer
vi.mock("@apollo/server", () => ({
  ApolloServer: vi.fn(),
}));

// Mock the schema package
vi.mock("@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema", () => ({
  typeDefs: "mock-schema",
}));

// Mock resolvers
vi.mock("#graphql/resolvers", () => ({
  resolvers: { Query: {}, Mutation: {} },
}));

// Mock context
vi.mock("#context", () => ({
  GraphQLContext: {},
}));

describe("createApolloServer", () => {
  const mockApolloServer = {
    // Add any methods that might be called on the server
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (ApolloServer as any).mockReturnValue(mockApolloServer);
    delete process.env.NODE_ENV;
    delete process.env.ENV;
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.ENV;
  });

  it("creates ApolloServer with development configuration", () => {
    process.env.NODE_ENV = "development";

    const result = createApolloServer();

    expect(ApolloServer).toHaveBeenCalledWith({
      typeDefs: "mock-schema",
      resolvers: { Query: {}, Mutation: {} },
      plugins: [
        expect.objectContaining({
          // This should be the local landing page plugin
        }),
      ],
    });
    expect(result).toBe(mockApolloServer);
  });

  it("creates ApolloServer with production configuration", () => {
    process.env.NODE_ENV = "production";

    const result = createApolloServer();

    expect(ApolloServer).toHaveBeenCalledWith({
      typeDefs: "mock-schema",
      resolvers: { Query: {}, Mutation: {} },
      plugins: [
        expect.objectContaining({
          // This should be the production landing page plugin
        }),
      ],
    });
    expect(result).toBe(mockApolloServer);
  });

  it("creates ApolloServer with beta environment", () => {
    process.env.ENV = "BETA";

    const result = createApolloServer();

    expect(ApolloServer).toHaveBeenCalledWith({
      typeDefs: "mock-schema",
      resolvers: { Query: {}, Mutation: {} },
      plugins: [
        expect.objectContaining({
          // This should be the local landing page plugin (beta = dev)
        }),
      ],
    });
    expect(result).toBe(mockApolloServer);
  });

  it("creates ApolloServer with undefined environment variables", () => {
    // No environment variables set

    const result = createApolloServer();

    expect(ApolloServer).toHaveBeenCalledWith({
      typeDefs: "mock-schema",
      resolvers: { Query: {}, Mutation: {} },
      plugins: [
        expect.objectContaining({
          // This should be the local landing page plugin (undefined = dev)
        }),
      ],
    });
    expect(result).toBe(mockApolloServer);
  });

  it("creates ApolloServer with both NODE_ENV and ENV set", () => {
    process.env.NODE_ENV = "production";
    process.env.ENV = "BETA";

    const result = createApolloServer();

    expect(ApolloServer).toHaveBeenCalledWith({
      typeDefs: "mock-schema",
      resolvers: { Query: {}, Mutation: {} },
      plugins: [
        expect.objectContaining({
          // This should be the local landing page plugin (beta overrides production)
        }),
      ],
    });
    expect(result).toBe(mockApolloServer);
  });
});
