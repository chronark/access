export type TokenSetRequest = {
  /**
   * Can be a tenant id for example.
   * This is just a way to find multiple tokens grouped by a key
   */
  owner?: string;

  /**
   * The hash of the token, which the user will use to authenticate.
   */
  hash: string;
  /**
   * Unix timestamp in seconds. If not set, the token will be valid forever.
   */
  expiresAt?: number;

  /**
   * The serialised data
   */
  data: string;
};

/**
 * List tokens from an owner
 */
export type TokenListRequest = {
  owner: string;
};
export type TokenListResponse = {
  owner: string | null;
  hash: string;
  expiresAt: number | null;
  data: string;
}[];

export type TokenGetRequest = {
  hash: string;
};

export type TokenGetResponse = {
  owner: string | null;
  hash: string;
  expiresAt: number | null;
  data: string;
} | null;

export type TokenDeleteRequest =
  | {
      owner: string;
      hash?: never;
    }
  | {
      hash: string;
      owner?: never;
    };

export interface Store {
  /**
   * Set a token with the provided data.
   */
  set(req: TokenSetRequest): Promise<void>;

  /**
   * List tokens based on the provided tags.
   */
  list(req: TokenListRequest): Promise<TokenListResponse>;

  /**
   * Get a specific token based on the provided tags and hash.
   */
  get(req: TokenGetRequest): Promise<TokenGetResponse>;

  /**
   * Delete a token based on the provided tags or hash.
   */
  delete(req: TokenDeleteRequest): Promise<void>;
}
