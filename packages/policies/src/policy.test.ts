import { Statement, SubArray } from "./types";
import { Policy } from "./policy";
import { describe, expect, it, beforeEach } from "@jest/globals";
// Define some test resources
type Resources = {
  channel: ["read", "ingest", "update"];
  user: ["update", "read"];
};

describe("constructor", () => {
  it("creates a Policy with a single statement", () => {
    const statement: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };
    const singleStatementPolicy = new Policy<Resources>(statement);
    expect(singleStatementPolicy.statements.length).toBe(1);
    expect(singleStatementPolicy.statements[0]).toEqual(statement);
  });

  it("creates a Policy with multiple statements", () => {
    const statement1: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };

    const statement2: Statement<Resources> = {
      resources: {
        channel: {
          channel_456: ["read"],
        },
        user: {
          user_456: ["read"],
        },
      },
    };

    const multipleStatementsPolicy = new Policy<Resources>([statement1, statement2]);
    expect(multipleStatementsPolicy.statements.length).toBe(2);
    expect(multipleStatementsPolicy.statements[0]).toEqual(statement1);
    expect(multipleStatementsPolicy.statements[1]).toEqual(statement2);
  });

  it("sets the default version to 'v1'", () => {
    const statement: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };
    const policyWithDefaultVersion = new Policy<Resources>(statement);
    expect(policyWithDefaultVersion.version).toBe("v1");
  });

  it("sets a custom version when provided", () => {
    const statement: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };
    const customVersion = "v1";
    const policyWithCustomVersion = new Policy<Resources>(statement, {
      version: customVersion,
    });
    expect(policyWithCustomVersion.version).toBe(customVersion);
  });
});

describe("toString", () => {
  it("returns a serialized Policy with a single statement", () => {
    const statement: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };
    const singleStatementPolicy = new Policy<Resources>(statement);
    const serializedPolicy = singleStatementPolicy.toString();
    expect(serializedPolicy).toBe(
      JSON.stringify({
        version: "v1",
        statements: [statement],
      }),
    );
  });

  it("returns a serialized Policy with multiple statements", () => {
    const statement1: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };

    const statement2: Statement<Resources> = {
      resources: {
        channel: {
          channel_456: ["read"],
        },
        user: {
          user_456: ["read"],
        },
      },
    };

    const multipleStatementsPolicy = new Policy<Resources>([statement1, statement2]);
    const serializedPolicy = multipleStatementsPolicy.toString();
    expect(serializedPolicy).toBe(
      JSON.stringify({
        version: "v1",
        statements: [statement1, statement2],
      }),
    );
  });
});

describe("parse", () => {
  it("parses a serialized Policy with a single statement", () => {
    const statement: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };
    const singleStatementPolicy = new Policy<Resources>(statement);
    const serializedPolicy = singleStatementPolicy.toString();

    const parsedPolicy = Policy.parse<Resources>(serializedPolicy);
    expect(parsedPolicy.version).toBe("v1");
    expect(parsedPolicy.statements.length).toBe(1);
    expect(parsedPolicy.statements[0]).toEqual(statement);
  });

  it("parses a serialized Policy with multiple statements", () => {
    const statement1: Statement<Resources> = {
      resources: {
        channel: {
          channel_123: ["read"],
        },
        user: {
          user_12kkk3: ["read", "update"],
        },
      },
    };

    const statement2: Statement<Resources> = {
      resources: {
        channel: {
          channel_456: ["read"],
        },
        user: {
          user_456: ["read"],
        },
      },
    };

    const multipleStatementsPolicy = new Policy<Resources>([statement1, statement2]);
    const serializedPolicy = multipleStatementsPolicy.toString();

    const parsedPolicy = Policy.parse<Resources>(serializedPolicy);
    expect(parsedPolicy.version).toBe("v1");
    expect(parsedPolicy.statements.length).toBe(2);
    expect(parsedPolicy.statements[0]).toEqual(statement1);
    expect(parsedPolicy.statements[1]).toEqual(statement2);
  });

  it("throws an error when parsing an unsupported policy version", () => {
    const unsupportedVersionPolicy = `{"version": "v2", "statements": []}`;
    expect(() => Policy.parse<Resources>(unsupportedVersionPolicy)).toThrow(
      "Unsupported policy version: v2",
    );
  });
});

describe("matchAction", () => {
  const statement: Statement<Resources> = {
    resources: {
      channel: {
        channel_123: ["read", "ingest"],
        channel_456: ["read"],
      },
      user: {
        user_12kkk3: ["read", "update"],
        user_456: ["read"],
      },
    },
  };
  const policy = new Policy<Resources>(statement);

  it("returns true when the resource type, resource ID, and action type match", () => {
    expect(policy.matchAction(statement, "channel:read", "channel_123")).toBe(true);
  });

  it("returns true when the action type is allowed for the same resource with a different action", () => {
    expect(policy.matchAction(statement, "channel:ingest", "channel_123")).toBe(true);
  });

  it("returns false when the resource type does not match", () => {
    expect(policy.matchAction(statement, "user:read", "channel_123")).toBe(false);
  });

  it("returns false when the resource ID does not match", () => {
    expect(policy.matchAction(statement, "channel:read", "channel_789")).toBe(false);
  });

  it("returns false when the action type does not match", () => {
    // @ts-expect-error the point of this test is to try and match something that is not valid
    expect(policy.matchAction(statement, "channel:xxx", "channel_123")).toBe(false);
  });

  it("returns false when the resource type and resource ID match, but the action type is not allowed", () => {
    expect(policy.matchAction(statement, "channel:ingest", "channel_456")).toBe(false);
  });

  it("returns false when the resource type, resource ID, and action type do not match", () => {
    expect(policy.matchAction(statement, "channel:ingest", "channel_789")).toBe(false);
  });

  it("returns false when matching a non-existing resource type", () => {
    expect(
      // @ts-expect-error the point of this test is to try and match something that is not valid
      policy.matchAction(statement, "non_existing_resource:read", "non_existing_resource_123"),
    ).toBe(false);
  });
});

describe("validate", () => {
  const statement: Statement<Resources> = {
    resources: {
      channel: {
        channel_123: ["read", "ingest"],
        channel_456: ["read"],
      },
      user: {
        user_12kkk3: ["read", "update"],
        user_456: ["read"],
      },
    },
  };
  const policy = new Policy<Resources>(statement);

  it("returns valid when the action is allowed", () => {
    const result = policy.validate("channel:read", "channel_123");
    expect(result).toEqual({ valid: true });
  });

  it("returns valid when the action is allowed for all wildcards", () => {
    const statementWithWildcard: Statement<Resources> = {
      resources: {
        user: {
          "user-*": ["read", "update"],
        },
      },
    };
    const policy = new Policy<Resources>(statementWithWildcard);
    const result = policy.validate(["user:read"], "user-123");
    expect(result).toEqual({ valid: true });
  });

  it("wildcard denies overrule specific allows", () => {
    const deny: Statement<Resources> = {
      deny: true,
      resources: {
        user: {
          "user-*": ["update"],
        },
      },
    };
    const allow: Statement<Resources> = {
      resources: {
        user: {
          "user-allow": ["read", "update"],
        },
      },
    };
    const policy = new Policy<Resources>([deny, allow]);
    const denied = policy.validate(["user:update"], "user-123");
    expect(denied).toEqual({
      valid: false,
      error: "Action user:update is not allowed",
    });

    const allowed = policy.validate(["user:update"], "user-allow");
    expect(allowed).toEqual({
      valid: false,
      error: "Action user:update is not allowed",
    });
  });

  it("returns valid when multiple actions are allowed", () => {
    const result = policy.validate(["channel:read", "channel:ingest"], "channel_123");
    expect(result).toEqual({ valid: true });
  });

  it("returns error when the action is denied", () => {
    const result = policy.validate("channel:update", "channel_123");
    expect(result).toEqual({
      valid: false,
      error: 'Action "channel:update" not allowed on resource "channel_123"',
    });
  });

  it("returns error when at least one action is not allowed", () => {
    // @ts-expect-error the point of this test is to try and match something that is not valid
    const result = policy.validate(["channel:read", "channel:xxx"], "channel_123");
    expect(result).toEqual({
      valid: false,
      error: 'Action "channel:xxx" not allowed on resource "channel_123"',
    });
  });

  it("returns error when there is no matching statement", () => {
    const result = policy.validate("user:update", "user_123");
    expect(result).toEqual({
      valid: false,
      error: 'Action "user:update" not allowed on resource "user_123"',
    });
  });

  it("returns error when a deny statement is present and matches the action", () => {
    const denyStatement: Statement<Resources> = {
      deny: true,
      resources: {
        channel: {
          channel_123: ["ingest"],
        },
      },
    };
    const denyPolicy = new Policy<Resources>([statement, denyStatement]);
    const result = denyPolicy.validate("channel:ingest", "channel_123");
    expect(result).toEqual({
      valid: false,
      error: "Action channel:ingest is not allowed",
    });
  });

  it("returns valid when a deny statement is present but does not match the action", () => {
    const denyStatement: Statement<Resources> = {
      deny: true,
      resources: {
        channel: {
          channel_123: ["ingest"],
        },
      },
    };
    const denyPolicy = new Policy<Resources>([statement, denyStatement]);
    const result = denyPolicy.validate("channel:read", "channel_123");
    expect(result).toEqual({ valid: true });
  });

  it("returns error when there are only deny statements and no matching allow statement", () => {
    const denyStatement: Statement<Resources> = {
      deny: true,
      resources: {
        channel: {
          channel_123: ["read"],
        },
      },
    };
    const denyPolicy = new Policy<Resources>([denyStatement]);
    const result = denyPolicy.validate("channel:read", "channel_123");
    expect(result).toEqual({
      valid: false,
      error: "Action channel:read is not allowed",
    });
  });
});
