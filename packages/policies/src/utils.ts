import { Policy } from "./policy";
import type { Action, Resources, Statement, SubArray } from "./types";

export const policyToJSON = <TResources extends Resources, TResourceIdentifier extends string>(policy: Policy<TResources, TResourceIdentifier>) => {
    return JSON.parse(policy.toString()) as {
        statement: Statement<TResources>,
        action: Action<TResources>,
        resources: { [K in keyof TResources]?: Record<TResourceIdentifier, SubArray<TResources[K]>> }
    }
}

/**
 * Merge given policies into a single policy.
 *
 * @param policyOne The first policy object to merge.
 * @param policyTwo The second policy object to merge.
 * @returns A new policy object integrating both input policies.
 * @example
 * ```ts
 * import { mergePolicies } from "@chronark/access-policies";
 * import type { Resources, GRID } from "@your-lib/types";
 *
 * const policyOne = new Policy<Resources, GRID>({
 *   resources: {
 *     link: {
 *       "planetfall::link::*": ["create", "read"],
 *       "planetfall::link::1234": ["delete"],
 *     },
 *   },
 * });
 *
 * const policyTwo = new Policy<Resources, GRID>({
 *   resources: {
 *     team: {
 *       "vercel::team::xyz": ["create", "read", "addMember", "delete"],
 *     }
 *   },
 * });
 *
 * const mergedPolicy = mergePolicies<Resources, GRID>(policyOne, policyTwo);
 *
 * console.log(mergedPolicy.toString());
 *
 * // {
 * //   "version": "v1",
 * //   "statements": [
 * //     {
 * //       "resources": {
 * //         "link": {
 * //           "planetfall::link::*": ["create", "read"],
 * //           "planetfall::link::1234": ["delete"]
 * //         },
 * //         "team": {
 * //           "vercel::team::xyz": ["create", "read", "addMember", "delete"]
 * //         }
 * //       }
 * //     }
 * //   ]
 * // }
 * //
 * ```
 */
export const mergePolicies = <TResources extends Resources, TResourceIdentifier extends string = string>(
    policyOne: Policy<TResources, TResourceIdentifier>,
    policyTwo: Policy<TResources, TResourceIdentifier>,
): Policy<TResources, TResourceIdentifier> => {

    const map: Record<string, any> = {};

    [policyOne, policyTwo].forEach((policy) => {
        policy.statements.forEach(statement => {
            for (const resourceType in statement.resources) {
                if (!map[resourceType]) {
                    map[resourceType] = {};
                }
                for (const resourceId in statement.resources[resourceType]!) { // Non-null assertion added here
                    const resourceActions = statement.resources[resourceType]![resourceId]; // Non-null assertions added here
                    if (!map[resourceType][resourceId]) {
                        map[resourceType][resourceId] = new Set(resourceActions);
                    } else {
                        resourceActions.forEach((action: any) => {
                            (map[resourceType][resourceId] as Set<any>).add(action);
                        });
                    }
                }
            }
        });
    });

    // Transform Set back into an array
    for (const resourceType in map) {
        for (const resourceId in map[resourceType]) {
            map[resourceType][resourceId] = Array.from(map[resourceType][resourceId] as Set<any>);
        }
    }

    return new Policy<TResources, TResourceIdentifier>({ resources: map as any });
};
