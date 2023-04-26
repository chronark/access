import { InMemoryStore } from "./inMemoryStore";
import { testStore } from "./test/store.test";
import "@jest/globals";

testStore(() => new InMemoryStore());
