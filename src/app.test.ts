import { describe, it, expect } from "vitest";
import { createApolloServer, resolvers } from "./app.js";

type HelloData = { hello?: string };
type IntrospectionData = {
  __schema?: { queryType?: { name?: string } };
};

const INTROSPECTION = /* GraphQL */ `
  query {
    __schema { queryType { name } }
  }
`;

describe("resolvers", () => {
  it("hello returns expected string", () => {
    expect(resolvers.Query.hello()).toBe("Hello World!!!");
  });
});

describe("ApolloServer (executeOperation)", () => {
  it("answers hello query", async () => {
    const server = createApolloServer({ NODE_ENV: "test" });
    const res = await server.executeOperation({ query: "{ hello }" });

    if (res.body.kind !== "single") throw new Error(`Expected single, got ${res.body.kind}`);

    const data = res.body.singleResult.data as HelloData | null;
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(data?.hello).toBe("Hello World!!!");

    await server.stop();
  });

  it("allows introspection in BETA", async () => {
    const server = createApolloServer({ ENV: "BETA", NODE_ENV: "production" });
    const res = await server.executeOperation({ query: INTROSPECTION });

    if (res.body.kind !== "single") throw new Error(`Expected single, got ${res.body.kind}`);

    const data = res.body.singleResult.data as IntrospectionData | null;
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(data?.__schema?.queryType?.name).toBeDefined();

    await server.stop();
  });

  it("disables introspection in production", async () => {
    const server = createApolloServer({ NODE_ENV: "production" });
    const res = await server.executeOperation({ query: INTROSPECTION });

    if (res.body.kind !== "single") throw new Error(`Expected single, got ${res.body.kind}`);

    expect(res.body.singleResult.errors?.length).toBeGreaterThan(0);

    await server.stop();
  });
});
