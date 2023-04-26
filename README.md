<div align="center">
    <h1 align="center">@chronark/access-*</h1>
    <h5>E2E Typed Access Control</h5>
</div>

<br/>

A minimal library for access control. It is designed to be used together with
opaque access tokens by providing a simple interface to define roles with
different access permissions and verifying requests to resources.

- Fully typed
- Zero dependencies
- Serializable to store in a database

## Install

```
npm i @chronark/access-policies
```

## Usage

```ts

type Resources = {
  team: ["create", "invite" /* more */];
  joke: ["create", "read", "vote"];
};

/**
 * User or team id
 */
type TenantId = string;

/**
 * Just some uuid
 */
type JokeId = string;

type ResourceIdentifier = `${TenantId}-${keyof Resources}-${JokeId}`;

/**
 * Allow the policy owner to create jokes inside the vercel tenant
 */
const createJokesInVercel = new Policy<Resources, ResourceIdentifier>({
  resources: {
    joke: {
      "vercel-joke-*": ["create"],
    },
  },
});

/**
 * Or
 * 
 * Allow the policy owner to read and vote on all jokes across all tenants
 */
const readAndVoteJokesInAllTeams = new Policy<Resources, ResourceIdentifier>({
  resources: {
    joke: {
      "*-joke-*": ["read", "vote"],
    },
  },
});




/**
 * Verifying a request
 */
const { valid, error } = readAndVoteJokesInAllTeams.validate("joke:read", "vercel-joke-jokeId")

```
