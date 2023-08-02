
import { Policy, mergePolicies } from "../src";
import { expect, test } from "@jest/globals";

type Resources = {
    link: ["create", "read", "update", "delete"];
    team: ["create", "read", "addMember", "delete"];
};

type TenantId = string;
type ResourceId = string;
type GlobalResourceId = `${TenantId}::${keyof Resources}::${ResourceId}`;

test("should return correct policy when merging non-empty policy with empty policy", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {},
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read"],
                "planetfall::link::1234": ["delete"],
            },
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual(JSON.parse(policyTwo.toString()));
});

test("should return correct policy when merging two policies with the same resources but different actions", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read"],
            },
        },
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["update"],
            },
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {
                    link: {
                        "planetfall::link::*": ["create", "read", "update"],
                    },
                },
            },
        ],
    });
});

test("should return correct policy when merging two policies with different resources", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read"],
            },
        },
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            team: {
                "jayden::team::xyz": ["create", "read", "addMember", "delete"],
            }
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {
                    link: {
                        "planetfall::link::*": ["create", "read"],
                    },
                    team: {
                        "jayden::team::xyz": ["create", "read", "addMember", "delete"],
                    },
                },
            },
        ],
    });
});

test("should not duplicate actions when merging two policies with duplicate actions", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read"],
            },
        },
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read", "delete"],
            },
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {
                    link: {
                        "planetfall::link::*": ["create", "read", "delete"],
                    },
                },
            },
        ],
    });
});

test("merging policies where one has resources defined but with no actions", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {},
        },
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read", "delete"],
            },
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {
                    link: {
                        "planetfall::link::*": ["create", "read", "delete"],
                    },
                },
            },
        ],
    });
});

test("merging policies with overlapping resources and actions", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["create", "read"],
            },
        },
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {
            link: {
                "planetfall::link::*": ["read"],
            },
        },
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {
                    link: {
                        "planetfall::link::*": ["create", "read"],
                    },
                },
            },
        ],
    });
});

test("merging two completely empty policies", () => {
    const policyOne = new Policy<Resources, GlobalResourceId>({
        resources: {},
    });

    const policyTwo = new Policy<Resources, GlobalResourceId>({
        resources: {},
    });

    const mergedPolicy = mergePolicies(policyOne, policyTwo);

    expect(JSON.parse(mergedPolicy.toString())).toEqual({
        version: "v1",
        statements: [
            {
                resources: {},
            },
        ],
    });
});
