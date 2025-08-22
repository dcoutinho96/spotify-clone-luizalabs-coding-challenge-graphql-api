import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApolloServer } from "@apollo/server";
import type { GraphQLContext } from "./context";

const startStandaloneServerMock = vi.fn();
const createApolloServerMock = vi.fn();
const createContextMock = vi.fn();

vi.mock("@apollo/server/standalone", () => ({
  startStandaloneServer: startStandaloneServerMock,
}));

vi.mock("./app", () => ({
  createApolloServer: createApolloServerMock,
}));

vi.mock("./context", () => ({
  createContext: createContextMock,
}));

describe("entrypoint (index.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.PORT = "4321";
  });

  it("starts the server on the configured port", async () => {
    startStandaloneServerMock.mockResolvedValue({ url: "http://localhost:4321/" });
    createApolloServerMock.mockReturnValue({} as ApolloServer<GraphQLContext>);

    await import("./index");

    expect(createApolloServerMock).toHaveBeenCalledTimes(1);
    expect(startStandaloneServerMock).toHaveBeenCalledTimes(1);

    const calls = startStandaloneServerMock.mock.calls;
    const opts = calls[0][1] as { listen: { port: number } };
    expect(opts.listen.port).toBe(4321);
  });

  it("builds request context with Authorization header", async () => {
    let capturedContext: any;
    startStandaloneServerMock.mockImplementation(
      async (_server: ApolloServer<GraphQLContext>, opts: any) => {
        capturedContext = opts.context;
        return { url: "http://localhost:4321/" };
      }
    );
    createApolloServerMock.mockReturnValue({} as ApolloServer<GraphQLContext>);
    createContextMock.mockImplementation(({ req }) => ({
      token: req.headers.authorization ?? null,
    }));

    await import("./index");

    const ctx = await capturedContext({
      req: { headers: { authorization: "Bearer test-token" } },
    });

    expect(createContextMock).toHaveBeenCalledWith({
      req: { headers: { authorization: "Bearer test-token" } },
    });
    expect(ctx).toEqual({ token: "Bearer test-token" });
  });
});
