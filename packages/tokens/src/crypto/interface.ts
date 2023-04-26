export interface Generator {
  random: (bytes?: number) => Promise<string>;
}
export interface Hasher {
  hash: (key: string) => Promise<string>;
}
