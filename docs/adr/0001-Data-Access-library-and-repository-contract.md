# Data Access library and repository contract

## Status

Accepted

## Context

<!-- - Functions which call the database should not be exposed and used wontonly anywhere, a pattern should be followed by the project which decides where the functions should be called and imported.
<!-- - Due to multi tenant structure of the project, we want the database queries to be scoped to the tenant. For that each of the database calls done in each service call should be executed in a scoped tenant client, where the tenant Id is supplied to each call in advance  -->
<!-- - In a multi tenant architecutre, if database calls can be done from one client and have the possibility of changing the data of another client
- Any file can import the database call functions from repository and call them. Therefore a change can happen through a code path nobody reviwed. -->
<!-- - The database calls in a service should be using the same connection client, so that they are isolated from other tenants and also so that if they are envolped in a transaction they will be running on the same client -->
<!-- - If the database calls for a single service a made on whatever connection client is available then database function calls for a single service can run on differnet connection client therby making the transactions useless   -->
<!-- - This transaction and the pool client should be provided through a central library rather than being created by each service by itself in whatever manner  -->
<!-- - If each service file creates its own transaction object then it can modify it, where it doesn't have the permission to and add data to it -->

- Tessera is multi-tenant: every tenant's rows live in the same tables. A query
  that runs without the tenant set can read or change another tenant's data.
  Nothing fails loudly when this happens; the response looks normal, and the
  first person to notice may be a customer seeing someone else's documents.
- Any file can import a repository and call it. A write can therefore happen
  through a code path that nobody reviewed for tenant scoping.
- The tenant is set with `SET LOCAL`, which lives on one connection and only
  inside its transaction. If the calls in one service operation are made on
  whatever pooled client is free, they can land on different clients: some
  run outside the transaction, without the tenant set, and the transaction no
  longer protects the operation.
- If each service checks out and manages its own client, every service has to
  remember the same steps: begin, set the tenant, commit or roll back, and
  release. A forgotten tenant leaks data; a forgotten `release()` slowly
  drains the pool until requests hang.
- The SQL this project depends on (`SET LOCAL`, `FOR UPDATE SKIP LOCKED`,
  `ON CONFLICT`) has to be visible and explainable, not generated behind an
  abstraction.

<!-- ##  Decisions

- This project will be using raw pg instead of kysely, seqeulize or other ORMs because having raw pg will help in better understanding what is happening under the hood.
- All the transactions will be through an create Executor function , which are all branded therby stopping someone from creating their own , which will be only available to import from the public files and inside the service files only.
- All calls in repositories will be made available through a factory method which will take the executor object as argument while creating the factory. -->

## Decision

**Library: `pg` with hand-written SQL.** Rejected options:

- Sequelize (an ORM; familiar from earlier work): it hides the SQL this project
  needs to see, and its `useCLS` makes the scoped transaction implicit.
- Kysely (a typed query builder, not an ORM): it would give typed results,
  but adds an abstraction between the code and the SQL being learned.

**Scope: a branded executor, created only by `packages/db`.**

- `withTenant(tenantId)` checks out one client from the pool and returns a
  `TenantExecutor`. `withSystem()` returns a separate `SystemExecutor` for
  work that isn't tied to a tenant.
- Both types carry a `unique symbol` brand that isn't exported, so code
  outside `packages/db` can't build one with an object literal. The type
  tests in `executor.typetest.ts` check this.
- `withTenant` does not yet begin a transaction or set the tenant on the
  connection. That comes with tenancy; this ADR fixes the contract, not
  the internals.

**Ownership: the service borrows and releases; repositories only use.**

- Services import `withTenant`, `withSystem` and `releaseExecutor` only through
  `packages/db/public.db.ts`. Lint enforces this: routes can't import
  `packages/db` at all, and repositories may import the executor _types_ only.
- A service calls `withTenant`, passes the executor to every repository it
  uses, and calls `releaseExecutor` in `finally`.

**Repository shape: a factory that takes the executor.**
`documentRepository(executor)` returns the query functions. Every query in a
repository therefore runs on the client it was given; a repository can't
reach the pool itself.

**Error translation:** not decided here. Repositories currently let `pg`
errors pass through unchanged; typed error translation is Stage 00.5.

## Consequences
<!-- 
- Using raw pg will loose the type safety as types will have to be manually configured.
- Strict type level import boundary rules will be enforced by the linter.
- All database calls in a service will be through the same pool client -->
## Consequences

**What we gave up**
- No typed query results. `query()` returns rows the compiler knows nothing
  about, so a typo in a column name or a changed schema shows up at runtime,
  not at build time. Row types have to be written and kept in sync by hand.
- The brand is a compile-time check only. An `as TenantExecutor` cast, or an
  `any` that reaches a repository, gets past it. Code review and the lint
  boundaries are the backstop, not the compiler.
- Releasing the client is still manual. A service that forgets `finally`
  leaks a connection; nothing enforces the borrow/release pattern except
  convention and review.
- With the factory, the scope is set when the repository is created, not at
  each call. A call like `repo.readDocument(id)` doesn't show which tenant it
  runs as; you have to look back to where `documentRepository(executor)` was
  called.
- More code than an ORM: every query, mapping and join is written by hand.

**What we get**
- Every statement is visible SQL, including `SET LOCAL` and the locking
  clauses once they arrive.
- A repository can't run a query outside a scope: it has no pool to reach,
  only the client it was given. Code outside `packages/db` can't make a scope
  without `withTenant`.
- Layer rules are lint errors, not conventions.

**Cost of reversing**
Switching to Kysely or an ORM later means rewriting the repository files and
`packages/db`. Services and routes don't change, because they only see the
repository functions and the executor. The repository boundary keeps this
decision contained.
