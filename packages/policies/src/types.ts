export type Resources = {
  [resourceType: string]: string[];
};
// Transforms an array into any combination of 0 or more of its members
export type SubArray<T extends unknown[]> = T[number][];

/**
 * A type representing a statement in an access control policy. A statement specifies whether to
 * allow or deny access to a set of resources based on a set of conditions. The Statement type takes
 * in a generic type T that extends the Resources type, which defines the available resources and
 * their possible actions.
 *
 * @example
 * type Resources = {
 *  team: ['read', 'write'];
 *  user: ['read', 'update'];
 * };
 * const s: Statement<Resources> = {
 *  deny: true,
 *  resources: {
 *      team: {
 *          team_123: ["read"],
 *      },
 *      user: {
 *          user_123: ["read", "update"],
 *      },
 *  },
 * };
 */
export type Statement<T extends Resources, TResourceIdentifier extends string = string> = {
  /**
   * Whether the statement allows or denies access to the resources.
   *
   * @default false
   */
  deny?: boolean;

  /**
   * An object that specifies which resoruces  the statement applies to. The object
   * has keys that correspond to the keys of the generic type T, which represent the types of
   * available resources. Each value in the object is another object that maps resource IDs to
   * arrays of actions.
   */
  resources: {
    [K in keyof T]?: Record<TResourceIdentifier, SubArray<T[K]>>;
  };
};

/**
 *  Here, the Result type is still a generic type that takes in a type T that extends the Actions
 *  type. It uses a mapped type to iterate over the keys of the T object and create a string literal
 *  union of all the possible combinations of resourceId:action strings. The [keyof T] at the end of
 *  the type definition means that the resulting type is a union of all the possible string literal
 *  unions created by the mapped type.
 *
 *  In the example, we define a new MyActions type that matches the Actions type from the original
 *  question, and then use the Result type to transform it into the desired MyResult type. The
 *  resulting type is "team:read" | "team:write", which matches the expected output.
 *
 *
 *  @example
 * type Resources = {
 *   team: ['read', 'write'];
 * };
 *
 * type MyResult = Action<Resources>; // type MyResult = "team:read" | "team:write"
 */
export type Action<T extends Record<string, string[]>> = {
  [K in keyof T]: `${K & string}:${T[K][number] & string}`;
}[keyof T];
