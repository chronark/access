import type { Policy } from "./policy";
import type { Action, Resources, Statement, SubArray } from "./types";

export const policyToJSON = <TResources extends Resources, TResourceIdentifier extends string>(policy: Policy<TResources, TResourceIdentifier>) => {
    return JSON.parse(policy.toString()) as {
        statement: Statement<TResources>,
        action: Action<TResources>,
        resources: { [K in keyof TResources]?: Record<TResourceIdentifier, SubArray<TResources[K]>> }
    }
}
