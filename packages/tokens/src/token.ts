import { Store } from "./storage";
import { Generator, Hasher } from "./crypto/interface";

interface Marshaller {
  toString(): string;
}

export type TokenManagerConfig = {
  store: Store;

  crypto: Generator & Hasher;
};

export class TokenManager<TData extends Marshaller> {
  private readonly store: Store;
  private readonly crypto: Generator & Hasher;

  constructor(opts: TokenManagerConfig) {
    this.store = opts.store;
    this.crypto = opts.crypto;
  }

  public async generateToken(opts: {
    key?: { size?: number; prefix?: string };
    data: TData;
    expiresAt?: number;
    owner?: string;
  }): Promise<[string, Token<TData>]> {
    let secret = await this.crypto.random(opts?.key?.size ?? 32);
    if (opts?.key?.prefix) {
      secret = `${opts.key.prefix}${secret}`;
    }

    const hash = await this.hash(secret);
    const token = new Token<TData>({
      data: opts.data,
      hash,
      expiresAt: opts?.expiresAt,
    });

    // @ts-expect-error Not sure why
    await this.store.set({
      hash,
      data: opts.data.toString(),
      expiresAt: opts.expiresAt,
      owner: opts?.owner,
    });

    return [secret, token];
  }

  // async load<TData>(secret: string): Promise<TData | null> {
  //   return this.store.get({ hash: await this.hash(secret>) })
  // }

  async hash(s: string) {
    return this.crypto.hash(s);
  }
}

export class Token<TData> {
  public readonly data: TData;
  public readonly expiresAt: number | null;
  public readonly hash: string;

  constructor(opts: {
    data: TData;
    expiresAt: number | undefined;
    hash: string;
  }) {
    this.data = opts.data;
    this.expiresAt = opts.expiresAt ?? null;
    this.hash = opts.hash;
  }
}
