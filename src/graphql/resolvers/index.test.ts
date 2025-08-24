import { describe, it, expect } from "vitest";
import { resolvers } from "./index";

describe("resolvers", () => {
  it("exports Query resolvers", () => {
    expect(resolvers.Query).toBeDefined();
    expect(typeof resolvers.Query).toBe("object");
  });

  it("exports Mutation resolvers", () => {
    expect(resolvers.Mutation).toBeDefined();
    expect(typeof resolvers.Mutation).toBe("object");
  });

  it("exports Artist field resolvers", () => {
    expect(resolvers.Artist).toBeDefined();
    expect(typeof resolvers.Artist).toBe("object");
  });

  it("exports Playlist field resolvers", () => {
    expect(resolvers.Playlist).toBeDefined();
    expect(typeof resolvers.Playlist).toBe("object");
  });
});
