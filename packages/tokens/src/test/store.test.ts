import {
  TokenDeleteRequest,
  Store,
  TokenSetRequest,
  TokenListRequest,
  TokenGetRequest,
} from "../storage";

function random(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < 16; i++) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return str;
}

export function testStore(newStore: () => Store | Promise<Store>) {
  describe("delete()", () => {
    it("should delete a token by its hash", async () => {
      const store = await newStore();
      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      const req: TokenDeleteRequest = { hash: token.hash };
      await store.delete(req);

      const storedToken = await store.get({ hash: token.hash });
      expect(storedToken).toBeNull();
    });

    it("should delete tokens by owner", async () => {
      const store = await newStore();
      const token = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      const req: TokenDeleteRequest = { owner: token.owner };
      await store.delete(req);

      const storedToken = await store.get({ hash: token.owner });
      expect(storedToken).toBeNull();
    });

    it("should not delete tokens when a nonexistent hash is provided", async () => {
      const store = await newStore();
      const token = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      await store.delete({ hash: "non-existent" });

      const storedToken = await store.get({ hash: token.hash });
      expect(storedToken).toEqual({
        hash: token.hash,
        data: token.data,
        owner: token.owner,
        expiresAt: null,
      });
    });

    it("should not delete tokens when a nonexistent owner is provided", async () => {
      const store = await newStore();
      const token = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      const req: TokenDeleteRequest = { owner: "nonexistent" };
      await store.delete(req);

      const tokens = await store.list({ owner: token.owner });
      expect(tokens.length).toBe(1);
    });

    it("should delete a token with no owner", async () => {
      const store = await newStore();
      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      const req: TokenDeleteRequest = { hash: token.hash };
      await store.delete(req);

      const storedToken = await store.get({ hash: "hash3" });
      expect(storedToken).toBeNull();
    });

    it("should delete a token with an expiration time", async () => {
      const store = await newStore();
      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);
      const req: TokenDeleteRequest = { hash: token.hash };
      await store.delete(req);

      const storedToken = await store.get({ hash: token.hash });
      expect(storedToken).toBeNull();
    });
  });

  describe("set()", () => {
    it("should store a token with owner", async () => {
      const store = await newStore();
      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);

      const storedToken = await store.get({ hash: token.hash });
      expect(storedToken).toEqual({
        hash: token.hash,
        data: token.data,
        owner: token.owner,
        expiresAt: null,
      });
    });

    it("should store a token without owner", async () => {
      const store = await newStore();
      const req: TokenSetRequest = {
        hash: "hash2",
        data: "data2",
      };
      await store.set(req);

      const storedToken = await store.get({ hash: req.hash });
      expect(storedToken).toEqual({
        hash: req.hash,
        data: req.data,
        owner: null,
        expiresAt: null,
      });
    });

    it("should store a token with an expiration time", async () => {
      const store = await newStore();
      const expirationTime = Date.now() + 10000;
      const req: TokenSetRequest = {
        hash: "hash3",
        data: "data3",
        owner: "owner3",
        expiresAt: expirationTime,
      };
      await store.set(req);

      const storedToken = await store.get({ hash: req.hash });
      expect(storedToken).toEqual({
        hash: req.hash,
        data: req.data,
        owner: req.owner,
        expiresAt: expirationTime,
      });
    });
  });

  describe("list()", () => {
    it("should list tokens with a specific owner", async () => {
      const store = await newStore();

      const tokens: TokenSetRequest[] = [
        {
          hash: random(),
          owner: random(),
          data: random(),
        },
        {
          hash: random(),
          owner: random(),
          data: random(),
        },
      ];
      for (const t of tokens) {
        await store.set(t);
      }

      const req: TokenListRequest = { owner: tokens.at(0)!.owner! };
      const result = await store.list(req);
      expect(result).toEqual([
        {
          owner: tokens.at(0)!.owner,
          hash: tokens.at(0)!.hash,
          expiresAt: null,
          data: tokens.at(0)!.data,
        },
      ]);
    });

    it("should list no tokens when no tokens match the owner filter", async () => {
      const store = await newStore();

      const tokens: TokenSetRequest[] = [
        {
          hash: random(),
          owner: random(),
          data: random(),
        },
        {
          hash: random(),
          owner: random(),
          data: random(),
        },
      ];
      for (const t of tokens) {
        await store.set(t);
      }

      const req: TokenListRequest = { owner: "nonexistent" };
      const result = await store.list(req);
      expect(result).toEqual([]);
    });

    it("should list no tokens when the store is empty", async () => {
      const store = await newStore();

      const req: TokenListRequest = { owner: "abc" };
      const result = await store.list(req);
      expect(result).toEqual([]);
    });
  });

  describe("get()", () => {
    it("should return the correct token by hash", async () => {
      const store = await newStore();

      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
      };
      await store.set(token);

      const result = await store.get({ hash: token.hash });
      expect(result).toEqual({
        owner: token.owner,
        hash: token.hash,
        expiresAt: null,
        data: token.data,
      });
    });

    it("should return null if token not found", async () => {
      const store = await newStore();
      const req: TokenGetRequest = { hash: "nonexistent" };
      const result = await store.get(req);
      expect(result).toBeNull();
    });

    it("should return the correct token with no owner", async () => {
      const store = await newStore();

      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
      };
      await store.set(token);

      const req: TokenGetRequest = { hash: token.hash };
      const result = await store.get(req);
      expect(result).toEqual({
        owner: null,
        hash: token.hash,
        expiresAt: null,
        data: token.data,
      });
    });

    it("should return the correct token with an expiration time", async () => {
      const store = await newStore();

      const token: TokenSetRequest = {
        hash: random(),
        data: random(),
        owner: random(),
        expiresAt: Date.now() + 100000,
      };
      await store.set(token);

      const req: TokenGetRequest = { hash: token.hash };
      const result = await store.get(req);
      expect(result).toEqual({
        owner: token.owner,
        hash: token.hash,
        expiresAt: token.expiresAt,
        data: token.data,
      });
    });
  });
}

// just to avoid warning, that no tests in test file
describe("Delete test for Store implementations", () => {
  it("should be used per implementation", () => {});
});
