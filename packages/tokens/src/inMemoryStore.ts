import type {
  Store,
  TokenSetRequest,
  TokenDeleteRequest,
  TokenListRequest,
  TokenListResponse,
  TokenGetRequest,
  TokenGetResponse,
} from "./storage";

/**
 * InMemoryStore is useful for testing
 */
export class InMemoryStore implements Store {
  private readonly store: Map<
    string,
    { owner: string | null; expires: number | null; data: string }
  >;

  constructor() {
    this.store = new Map();
  }
  /**
   * Set a token with the provided policy.
   */
  public async set(req: TokenSetRequest): Promise<void> {
    this.store.set(req.hash, {
      expires: req.expiresAt ?? null,
      data: req.data,
      owner: req.owner ?? null,
    });
  }

  /**
   * List tokens based on the provided tags.
   */
  public async list(req: TokenListRequest): Promise<TokenListResponse> {
    const tokens: TokenListResponse = [];

    for (const [hash, token] of this.store.entries()) {
      if (token.expires && token.expires < Date.now()) {
        this.store.delete(hash);
        continue;
      }

      if (!req.owner || (req.owner && req.owner === token.owner)) {
        tokens.push({
          owner: token.owner,
          hash,
          expiresAt: token.expires,
          data: token.data,
        });
      }
    }
    return tokens;
  }

  /**
   * Get a specific token based on the provided tags and hash.
   */
  public async get(req: TokenGetRequest): Promise<TokenGetResponse> {
    const token = this.store.get(req.hash);
    if (!token) {
      return null;
    }
    if (token.expires && token.expires < Date.now()) {
      this.store.delete(req.hash);
      return null;
    }
    return {
      owner: token.owner ?? null,
      hash: req.hash,
      expiresAt: token.expires ?? null,
      data: token.data,
    };
  }

  /**
   * Delete a token based on the provided tags or hash.
   */
  public async delete(req: TokenDeleteRequest): Promise<void> {
    for (const [hash, token] of this.store.entries()) {
      if (req.owner && req.owner === token.owner) {
        this.store.delete(hash);
      } else if (req.hash && req.hash === hash) {
        this.store.delete(hash);
      }
    }
  }
}
