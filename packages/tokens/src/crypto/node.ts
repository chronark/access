import { Generator, Hasher } from "./interface";
import crypto from "node:crypto";

export class NodeCrypto implements Generator, Hasher {
  async random(bytes?: number): Promise<string> {
    const buf = crypto.randomBytes(bytes ?? 32);
    return buf.toString("hex");
  }

  async hash(key: string): Promise<string> {
    return crypto.createHash("SHA-256").update(key).digest("hex");
  }
}
