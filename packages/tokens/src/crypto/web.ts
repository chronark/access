import { Generator, Hasher } from "./interface";

export class WebCrypto implements Generator, Hasher {
  async random(bytes?: number): Promise<string> {
    const buf = new Uint8Array(bytes ?? 32);
    crypto.getRandomValues(buf);
    return Array.from(buf)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async hash(key: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
