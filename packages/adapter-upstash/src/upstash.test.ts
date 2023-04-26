import { testStore } from "@chronark/access-tokens/src/test/store.test";
import { UpstashAdapter } from "./upstash";
import { Redis } from "@upstash/redis";

const newStore = async () => {
  const redis = Redis.fromEnv();
  await redis.flushdb();

  return new UpstashAdapter({ redis });
};

testStore(newStore);
