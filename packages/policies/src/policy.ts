import type { Action, Resources, Statement } from "./types";
import { filter } from "./wildcard";

export class Policy<TResources extends Resources, TResourceIdentifier extends string = string> {
  public readonly version: "v1";
  public readonly statements: Statement<TResources, TResourceIdentifier>[];
  constructor(
    statements:
      | Statement<TResources, TResourceIdentifier>
      | Statement<TResources, TResourceIdentifier>[],
    opts?: { version?: "v1" },
  ) {
    this.version = opts?.version ?? "v1";
    this.statements = Array.isArray(statements) ? statements : [statements];
  }

  toString() {
    return JSON.stringify({
      version: this.version,
      statements: this.statements,
    });
  }
  static parse<TResources extends Resources>(policy: string): Policy<TResources> {
    const parsed = JSON.parse(policy) as {
      version: string;
      statements: Statement<TResources>[];
    };
    if (parsed.version !== "v1") {
      throw new Error(`Unsupported policy version: ${parsed.version}`);
    }
    return new Policy<TResources>(parsed.statements, {
      version: parsed.version,
    });
  }

  public validate(
    actions: Action<TResources> | Action<TResources>[],
    resourceId: TResourceIdentifier,
  ): { valid: true; error?: never } | { valid: false; error: string } {
    /**
     * Go over deny statements first, since they have precedence over allow statements.
     */
    for (const statement of this.statements.filter((s) => s.deny)) {
      for (const action of Array.isArray(actions) ? actions : [actions]) {
        if (this.matchAction(statement, action, resourceId)) {
          return {
            valid: false,
            error: `Action ${action} is not allowed`,
          };
        }
      }
    }

    for (const statement of this.statements.filter((s) => !s.deny)) {
      for (const action of Array.isArray(actions) ? actions : [actions]) {
        if (!this.matchAction(statement, action, resourceId)) {
          return {
            valid: false,
            error: `Action "${action}" not allowed on resource "${resourceId}"`,
          };
        }
      }
      return { valid: true };
    }
    return {
      valid: false,
      error: "No matching statement found",
    };
  }

  public matchAction(
    statement: Statement<TResources>,
    action: Action<TResources>,
    resource: string,
  ): boolean {
    const [resourceType, actionType] = action.split(":");
    if (!statement.resources[resourceType]) {
      return false;
    }
    for (const resourceId in statement.resources[resourceType]) {
      const allowedActions = statement.resources[resourceType]![resourceId];

      // Check if the resourceAction is in the allowedActions array
      if (allowedActions.includes(actionType)) {
        const matchingResources = filter([resource], resourceId);
        if (matchingResources.length > 0) {
          return true;
        }
      }
    }

    return false;
  }
}
