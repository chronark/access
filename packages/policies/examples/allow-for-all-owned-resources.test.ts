import { Policy } from "../src";
import { expect, test } from "@jest/globals";

type Resources = {
  channel: ["read", "ingest", "update", "delete"];
};

test("example", () => {
  /**
   * allowReadAccess grants a tenant read access to all channels prefixed with `chronark-`
   */
  const allowReadAccess = new Policy<Resources>({
    resources: {
      channel: {
        "chronark-*": ["read"],
      },
    },
  });

  const serialised = allowReadAccess.toString();

  expect(serialised).toBe(
    '{"version":"v1","statements":[{"resources":{"channel":{"chronark-*":["read"]}}}]}',
  );

  /**
   * I want to update the following resource
   */
  const resourceId = "chronark-channel1";

  const updateResponse = allowReadAccess.validate("channel:update", resourceId);
  expect(updateResponse).toEqual({
    valid: false,
    error: 'Action "channel:update" not allowed on resource "chronark-channel1"',
  });

  /**
   * As expected, the access is denied, because the policy only allows read access, so let's try that
   */

  const readResponse = allowReadAccess.validate("channel:read", "chronark-channel1");
  expect(readResponse).toEqual({ valid: true });
});
