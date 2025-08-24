import { describe, it, expect } from "vitest";
import { SpotifyAuthError } from "./SpotifyAuthError";

describe("SpotifyAuthError", () => {
  it("creates error with default message", () => {
    const error = new SpotifyAuthError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("Unauthorized: Spotify token invalid or expired");
  });

  it("creates error with custom message", () => {
    const customMessage = "Custom authentication error message";
    const error = new SpotifyAuthError(customMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe(customMessage);
  });

  it("creates error with empty string message", () => {
    const error = new SpotifyAuthError("");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("");
  });

  it("creates error with null message", () => {
    const error = new SpotifyAuthError(null as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("null");
  });

  it("creates error with undefined message", () => {
    const error = new SpotifyAuthError(undefined as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("Unauthorized: Spotify token invalid or expired");
  });

  it("creates error with number message", () => {
    const error = new SpotifyAuthError(123 as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("123");
  });

  it("creates error with object message", () => {
    const objMessage = { key: "value" };
    const error = new SpotifyAuthError(objMessage as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("[object Object]");
  });

  it("creates error with array message", () => {
    const arrayMessage = [1, 2, 3];
    const error = new SpotifyAuthError(arrayMessage as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("1,2,3");
  });

  it("creates error with boolean message", () => {
    const error = new SpotifyAuthError(true as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("true");
  });

  it("creates error with function message", () => {
    const funcMessage = () => "function";
    const error = new SpotifyAuthError(funcMessage as any);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error.name).toBe("GraphQLError");
    expect(error.message).toBe("() => \"function\"");
  });

  it("creates error with symbol message", () => {
    const symbolMessage = Symbol("test");
    
    // GraphQLError cannot handle Symbol values, so this will throw
    expect(() => new SpotifyAuthError(symbolMessage as any)).toThrow();
  });
});
