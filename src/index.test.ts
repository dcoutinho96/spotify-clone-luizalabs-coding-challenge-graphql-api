import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { ApolloServer } from "@apollo/server";

type Context = { auth: string | null };

// Mock startStandaloneServer so we don't start a real server
vi.mock("@apollo/server/standalone", () => ({
  startStandaloneServer: vi.fn(
    async (
      _server: ApolloServer<Context>,
      opts: { listen?: { port?: number } } | undefined
    ) => {
      const port = opts?.listen?.port ?? 4000;
      return { url: `http://localhost:${port}/` };
    }
  ),
}));

// Mock createApolloServer to avoid constructing a real Apollo instance
vi.mock("./app.js", async () => {
  const actual = await vi.importActual<typeof import("./app.js")>("./app.js");
  return {
    ...actual,
    createApolloServer: vi.fn(
      () => ({}) as unknown as ApolloServer<Context>
    ),
  };
});

describe("entrypoint (index.ts)", () => {
  beforeEach(() => {
    process.env.PORT = "4321";
    process.env.ENV = "BETA";
    process.env.NODE_ENV = "production";
  });

  it("starts the server on the configured port", async () => {
    const { startStandaloneServer } = await import("@apollo/server/standalone");
    const { createApolloServer } = await import("./app.js");

    await import("./index.js");

    expect(createApolloServer).toHaveBeenCalled();

    const calls = (startStandaloneServer as unknown as Mock).mock.calls;
    const opts = calls[0][1] as { listen: { port: number } };
    expect(opts.listen.port).toBe(4321);
  });

  it("builds request context with Authorization header", async () => {
    const { startStandaloneServer } = await import("@apollo/server/standalone");

    await import("./index.js");

    const calls = (startStandaloneServer as unknown as Mock).mock.calls;
    const opts = calls[0][1] as {
      context: (arg: { req: { headers: { authorization?: string } } }) => Promise<Context>;
    };

    const ctx = await opts.context({
      req: { headers: { authorization: "Bearer test-token" } },
    });

    expect(ctx).toEqual({ auth: "Bearer test-token" });
  });
});
