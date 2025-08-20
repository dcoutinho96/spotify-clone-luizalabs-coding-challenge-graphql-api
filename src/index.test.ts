import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@apollo/server/standalone", () => ({
  startStandaloneServer: vi.fn(async (_server: unknown, opts: any) => {
    return { url: `http://localhost:${opts?.listen?.port ?? 4000}/` };
  }),
}));

vi.mock("./app.js", async () => {
  const actual = await vi.importActual<typeof import("./app.js")>("./app.js");
  return {
    ...actual,
    createApolloServer: vi.fn(() => ({} as any)),
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

    expect(startStandaloneServer).toHaveBeenCalled();
    const call = (startStandaloneServer as unknown as { mock: { calls: any[] } }).mock.calls[0];
    expect(call[1].listen.port).toBe(4321);
  });

  it("builds request context with Authorization header", async () => {
    const { startStandaloneServer } = await import("@apollo/server/standalone");

    await import("./index.js");

    const call = (startStandaloneServer as unknown as { mock: { calls: any[] } }).mock.calls[0];
    const opts = call[1];

    const ctx = await opts.context({
      req: { headers: { authorization: "Bearer test-token" } },
    });

    expect(ctx).toEqual({ auth: "Bearer test-token" });
  });
});
