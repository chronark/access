import type {
  Store,
  TokenSetRequest,
  TokenDeleteRequest,
  TokenListRequest,
  TokenListResponse,
  TokenGetRequest,
  TokenGetResponse,
} from "@chronark/access-tokens";

import type { Redis } from "@upstash/redis";

type StoredToken = {
  owner: string | null;
  hash: string;
  expiresAt: number | null;
  data: string;
};

export type UpstashAdapterConfig = {
  redis: Redis;

  /**
   * @default `@chronark/access`
   */
  prefix?: string;
};

/**
 * UpstashAdapter uses Upstash Redis as storage backend
 */
export class UpstashAdapter implements Store {
  private readonly redis: Redis;
  private readonly prefix: string;

  constructor(config: UpstashAdapterConfig) {
    this.redis = config.redis;
    this.prefix = config.prefix ?? "@chronark/access";
  }

  private ownerKey(owner: string): string {
    return [this.prefix, "owners", owner].join(":");
  }

  private hashKey(hash: string): string {
    return [this.prefix, "hashes", hash].join(":");
  }

  public async set(req: TokenSetRequest): Promise<void> {
    const p = this.redis.multi();
    p.set<StoredToken>(this.hashKey(req.hash), {
      hash: req.hash,
      expiresAt: req.expiresAt ?? null,
      data: req.data,
      owner: req.owner ?? null,
    });

    if (req.owner) {
      p.sadd(this.ownerKey(req.owner), req.hash);
    }

    await p.exec();
  }

  /**
   * List tokens from an owner.
   */
  public async list(req: TokenListRequest): Promise<TokenListResponse> {
    const hashes = await this.redis.smembers(this.ownerKey(req.owner));
    if (hashes.length === 0) {
      return [];
    }
    const res = await this.redis.mget<StoredToken[]>(...hashes.map((hash) => this.hashKey(hash)));

    return res.filter((t) => t !== null);
  }

  /**
   * Get a specific token based on the provided hash.
   */
  public async get(req: TokenGetRequest): Promise<TokenGetResponse> {
    return this.redis.get<StoredToken>(this.hashKey(req.hash));
  }

  /**
   * Delete a token based on the provided tags or hash.
   */
  public async delete(req: TokenDeleteRequest): Promise<void> {
    if ("owner" in req) {
      const hashes = await this.redis.smembers(this.ownerKey(req.owner));
      if (hashes.length === 0) {
        return;
      }
      await this.redis.del(this.ownerKey(req.owner), ...hashes.map((h) => this.hashKey(h)));
    } else if ("hash" in req) {
      await this.redis.del(this.hashKey(req.hash));
    }
  }
}
