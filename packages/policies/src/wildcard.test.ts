import { filter } from "./wildcard";
import { expect, it } from "@jest/globals";

it("returns an empty array when there are no matches", () => {
  const resources = ["resource-1", "resource-2"];
  const pattern = "not-exist-*";
  const result = filter(resources, pattern);
  expect(result).toEqual([]);
});

it("matches all resources with a wildcard pattern", () => {
  const resources = ["resource-1", "resource-2"];
  const pattern = "*";
  const result = filter(resources, pattern);
  expect(result).toEqual(resources);
});

it("matches a subset of resources with a specific pattern", () => {
  const resources = ["resource-1", "resource-2", "resource-3"];
  const pattern = "resource-2";
  const result = filter(resources, pattern);
  expect(result).toEqual(["resource-2"]);
});

it("matches resources with different prefixes", () => {
  const resources = ["resource-1", "other-1"];
  const pattern = "other-*";
  const result = filter(resources, pattern);
  expect(result).toEqual(["other-1"]);
});
