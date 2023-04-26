import { describe, it, expect } from "@jest/globals";
import { NodeCrypto } from "./crypto/node";
import { TokenManager } from "./token";
import { InMemoryStore } from "./inMemoryStore";

const crypto = new NodeCrypto();

describe("basic usage", () => {
  it("should create a token", async () => {
    const data = {
      hello: "world",
    };

    const tm = new TokenManager({ crypto, store: new InMemoryStore() });
    const [key, token] = await tm.generateToken({ data });
    expect(key).toBeTruthy();
    expect(token).toBeTruthy();
  });
});
